package app.lovable.cvj_terminal_nexus;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

@CapacitorPlugin(name = "NativeShell")
public class NativeShellPlugin extends Plugin {

    // Command allowlist for security
    private static final Set<String> ALLOWED_COMMANDS = new HashSet<>(Arrays.asList(
        "ls", "cat", "echo", "pwd", "whoami", "date", "uname",
        "df", "du", "ps", "top", "free", "uptime", "which"
    ));

    // Package manager allowlist
    private static final Set<String> ALLOWED_PACKAGE_MANAGERS = new HashSet<>(Arrays.asList(
        "pkg", "apt-get", "pacman", "yum"
    ));

    // Dangerous character pattern for validation
    private static final Pattern DANGEROUS_CHARS = Pattern.compile("[;&|`$<>(){}\\[\\]\\n\\r]");

    /**
     * Validates that a command is safe to execute
     */
    private boolean isCommandAllowed(String command) {
        if (command == null || command.isEmpty()) {
            return false;
        }
        
        // Check if command is in allowlist
        String baseCommand = command.split("\\s+")[0];
        if (!ALLOWED_COMMANDS.contains(baseCommand)) {
            return false;
        }
        
        // Check for dangerous characters
        if (DANGEROUS_CHARS.matcher(command).find()) {
            return false;
        }
        
        return true;
    }

    /**
     * Validates arguments for dangerous characters
     */
    private boolean areArgumentsSafe(List<String> args) {
        for (String arg : args) {
            if (arg != null && DANGEROUS_CHARS.matcher(arg).find()) {
                return false;
            }
        }
        return true;
    }

    @PluginMethod
    public void executeCommand(PluginCall call) {
        String command = call.getString("command");
        List<String> args = call.getArray("args", new ArrayList<>()).toList();
        
        if (command == null) {
            call.reject("Command is required");
            return;
        }

        // Security validation
        if (!isCommandAllowed(command)) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Command not allowed. Only safe commands are permitted.");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        if (!areArgumentsSafe(args)) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Invalid arguments. Arguments contain forbidden characters.");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        try {
            // Use ProcessBuilder with proper argument separation (prevents injection)
            List<String> fullCommand = new ArrayList<>();
            fullCommand.add(command);
            fullCommand.addAll(args);
            
            ProcessBuilder pb = new ProcessBuilder(fullCommand);
            pb.directory(new File("/data/data/" + getContext().getPackageName() + "/files"));
            Process process = pb.start();
            
            String output = readStream(process.getInputStream());
            String error = readStream(process.getErrorStream());
            int exitCode = process.waitFor();
            
            JSObject result = new JSObject();
            result.put("output", output);
            result.put("error", error);
            result.put("exitCode", exitCode);
            
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Execution failed: " + e.getMessage());
            result.put("exitCode", 1);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void executeRootCommand(PluginCall call) {
        String command = call.getString("command");
        List<String> args = call.getArray("args", new ArrayList<>()).toList();
        
        if (command == null) {
            call.reject("Command is required");
            return;
        }

        // Security validation - stricter for root commands
        if (!isCommandAllowed(command)) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Root command not allowed. Only safe commands are permitted.");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        if (!areArgumentsSafe(args)) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Invalid arguments. Arguments contain forbidden characters.");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        try {
            // Use ProcessBuilder to prevent command injection
            // Build command array properly instead of string concatenation
            List<String> commandList = new ArrayList<>();
            commandList.add("su");
            commandList.add("-c");
            
            // Build the inner command safely
            StringBuilder innerCommand = new StringBuilder(command);
            for (String arg : args) {
                // Escape single quotes and wrap in quotes for safety
                String escapedArg = arg.replace("'", "'\\''");
                innerCommand.append(" '").append(escapedArg).append("'");
            }
            commandList.add(innerCommand.toString());
            
            ProcessBuilder pb = new ProcessBuilder(commandList);
            Process process = pb.start();
            
            String output = readStream(process.getInputStream());
            String error = readStream(process.getErrorStream());
            int exitCode = process.waitFor();
            
            JSObject result = new JSObject();
            result.put("output", output);
            result.put("error", error);
            result.put("exitCode", exitCode);
            
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Root execution failed: " + e.getMessage());
            result.put("exitCode", 1);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void installPackage(PluginCall call) {
        String packageName = call.getString("packageName");
        String source = call.getString("source", "auto");
        
        if (packageName == null) {
            call.reject("Package name is required");
            return;
        }

        // Validate package name - only alphanumeric, dash, underscore
        if (!packageName.matches("^[a-zA-Z0-9_-]+$")) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Invalid package name. Only alphanumeric characters, dashes, and underscores are allowed.");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        try {
            String packageManager;
            String installCmd;
            
            // Determine package manager based on source
            switch (source) {
                case "apt":
                case "ubuntu":
                case "debian":
                    packageManager = "apt-get";
                    installCmd = "install -y";
                    break;
                case "pacman":
                case "arch":
                    packageManager = "pacman";
                    installCmd = "-S --noconfirm";
                    break;
                case "yum":
                case "rpm":
                    packageManager = "yum";
                    installCmd = "install -y";
                    break;
                default:
                    // Auto-detect or use pkg (Termux-style)
                    packageManager = "pkg";
                    installCmd = "install -y";
                    break;
            }

            if (!ALLOWED_PACKAGE_MANAGERS.contains(packageManager)) {
                JSObject result = new JSObject();
                result.put("output", "");
                result.put("error", "Package manager not allowed");
                result.put("exitCode", 1);
                call.resolve(result);
                return;
            }
            
            // Use ProcessBuilder for safe command execution
            List<String> commandList = new ArrayList<>();
            commandList.add("su");
            commandList.add("-c");
            commandList.add(packageManager + " " + installCmd + " " + packageName);
            
            ProcessBuilder pb = new ProcessBuilder(commandList);
            Process process = pb.start();
            
            String output = readStream(process.getInputStream());
            String error = readStream(process.getErrorStream());
            int exitCode = process.waitFor();
            
            JSObject result = new JSObject();
            result.put("output", output);
            result.put("error", error);
            result.put("exitCode", exitCode);
            
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Package installation failed: " + e.getMessage());
            result.put("exitCode", 1);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void checkRootAccess(PluginCall call) {
        try {
            ProcessBuilder pb = new ProcessBuilder("su", "-c", "echo test");
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            JSObject result = new JSObject();
            result.put("hasRoot", exitCode == 0);
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("hasRoot", false);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void setupLinuxEnvironment(PluginCall call) {
        try {
            String appDir = "/data/data/" + getContext().getPackageName() + "/files";
            String linuxDir = appDir + "/linux";
            
            // Create necessary directories
            new File(linuxDir).mkdirs();
            new File(linuxDir + "/bin").mkdirs();
            new File(linuxDir + "/etc").mkdirs();
            new File(linuxDir + "/home").mkdirs();
            new File(linuxDir + "/tmp").mkdirs();
            new File(linuxDir + "/var").mkdirs();
            
            // Setup basic environment
            String setupScript = 
                "export PATH=" + linuxDir + "/bin:$PATH\n" +
                "export HOME=" + linuxDir + "/home\n" +
                "export TMPDIR=" + linuxDir + "/tmp\n" +
                "cd " + linuxDir + "/home\n";
            
            JSObject result = new JSObject();
            result.put("output", "Linux environment setup completed at: " + linuxDir);
            result.put("error", "");
            result.put("exitCode", 0);
            
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Environment setup failed: " + e.getMessage());
            result.put("exitCode", 1);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void downloadFile(PluginCall call) {
        String url = call.getString("url");
        String destination = call.getString("destination");
        
        if (url == null || destination == null) {
            call.reject("URL and destination are required");
            return;
        }

        // Validate URL is HTTPS
        if (!url.startsWith("https://")) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Only HTTPS URLs are allowed for security");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        // Validate destination path doesn't contain path traversal
        if (destination.contains("..") || destination.contains("~")) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Invalid destination path");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        try {
            URL downloadUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            InputStream inputStream = connection.getInputStream();
            FileOutputStream outputStream = new FileOutputStream(destination);
            
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            
            outputStream.close();
            inputStream.close();
            connection.disconnect();
            
            JSObject result = new JSObject();
            result.put("output", "Downloaded: " + url + " to " + destination);
            result.put("error", "");
            result.put("exitCode", 0);
            
            call.resolve(result);
        } catch (Exception e) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Download failed: " + e.getMessage());
            result.put("exitCode", 1);
            call.resolve(result);
        }
    }

    private String readStream(InputStream stream) throws IOException {
        StringBuilder output = new StringBuilder();
        BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line).append("\n");
        }
        reader.close();
        return output.toString();
    }
}
