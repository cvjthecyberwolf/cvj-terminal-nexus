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
import java.util.List;

@CapacitorPlugin(name = "NativeShell")
public class NativeShellPlugin extends Plugin {

    @PluginMethod
    public void executeCommand(PluginCall call) {
        String command = call.getString("command");
        List<String> args = call.getArray("args", new ArrayList<>()).toList();
        
        if (command == null) {
            call.reject("Command is required");
            return;
        }

        try {
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

        try {
            // Build su command
            StringBuilder fullCommand = new StringBuilder("su -c \"");
            fullCommand.append(command);
            for (String arg : args) {
                fullCommand.append(" ").append(arg);
            }
            fullCommand.append("\"");
            
            Process process = Runtime.getRuntime().exec(fullCommand.toString());
            
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

        try {
            String installCommand;
            
            // Determine package manager based on source
            switch (source) {
                case "apt":
                case "ubuntu":
                case "debian":
                    installCommand = "apt-get install -y " + packageName;
                    break;
                case "pacman":
                case "arch":
                    installCommand = "pacman -S --noconfirm " + packageName;
                    break;
                case "yum":
                case "rpm":
                    installCommand = "yum install -y " + packageName;
                    break;
                default:
                    // Auto-detect or use pkg (Termux-style)
                    installCommand = "pkg install -y " + packageName;
                    break;
            }
            
            Process process = Runtime.getRuntime().exec("su -c \"" + installCommand + "\"");
            
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
            Process process = Runtime.getRuntime().exec("su -c echo test");
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

        try {
            URL downloadUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("GET");
            
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