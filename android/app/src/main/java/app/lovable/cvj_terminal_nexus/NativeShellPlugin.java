package app.lovable.cvj_terminal_nexus;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Environment;
import android.os.StatFs;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@CapacitorPlugin(
    name = "NativeShell",
    permissions = {
        @Permission(
            strings = { Manifest.permission.READ_EXTERNAL_STORAGE },
            alias = "storage"
        ),
        @Permission(
            strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE },
            alias = "writeStorage"
        )
    }
)
public class NativeShellPlugin extends Plugin {

    // Extended command allowlist for Termux-like functionality
    private static final Set<String> ALLOWED_COMMANDS = new HashSet<>(Arrays.asList(
        // Basic commands
        "ls", "cat", "echo", "pwd", "whoami", "date", "uname",
        "df", "du", "ps", "top", "free", "uptime", "which",
        // File operations
        "cp", "mv", "rm", "mkdir", "rmdir", "touch", "chmod", "chown",
        "head", "tail", "wc", "sort", "uniq", "grep", "find", "xargs",
        // Text processing
        "awk", "sed", "cut", "tr", "tee",
        // Network
        "ping", "curl", "wget", "netstat", "ifconfig", "ip",
        // System
        "id", "env", "printenv", "hostname", "arch", "nproc",
        // Package management
        "pkg", "apt", "apt-get", "dpkg"
    ));

    // Package manager allowlist
    private static final Set<String> ALLOWED_PACKAGE_MANAGERS = new HashSet<>(Arrays.asList(
        "pkg", "apt-get", "apt", "pacman", "yum", "dpkg"
    ));

    // Dangerous character pattern for validation
    private static final Pattern DANGEROUS_CHARS = Pattern.compile("[;&|`$<>(){}\\[\\]\\n\\r]");

    private String currentWorkingDirectory;
    private String homeDirectory;
    private String storageRoot;

    @Override
    public void load() {
        super.load();
        Context context = getContext();
        homeDirectory = context.getFilesDir().getAbsolutePath() + "/home";
        storageRoot = Environment.getExternalStorageDirectory().getAbsolutePath();
        currentWorkingDirectory = homeDirectory;
        
        // Create initial directories
        setupInitialDirectories();
    }

    private void setupInitialDirectories() {
        String[] dirs = {
            homeDirectory,
            homeDirectory + "/bin",
            homeDirectory + "/tmp",
            homeDirectory + "/downloads",
            homeDirectory + "/.config"
        };
        
        for (String dir : dirs) {
            new File(dir).mkdirs();
        }
    }

    /**
     * Validates that a command is safe to execute
     */
    private boolean isCommandAllowed(String command) {
        if (command == null || command.isEmpty()) {
            return false;
        }
        
        String baseCommand = command.split("\\s+")[0];
        if (!ALLOWED_COMMANDS.contains(baseCommand)) {
            return false;
        }
        
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

    /**
     * Resolves a path relative to current working directory
     */
    private String resolvePath(String path) {
        if (path == null || path.isEmpty()) {
            return currentWorkingDirectory;
        }
        
        if (path.startsWith("/")) {
            return path;
        }
        
        if (path.equals("~") || path.startsWith("~/")) {
            return homeDirectory + path.substring(1);
        }
        
        // Handle relative paths
        String resolved = currentWorkingDirectory + "/" + path;
        
        // Normalize path (remove .. and .)
        try {
            return new File(resolved).getCanonicalPath();
        } catch (IOException e) {
            return resolved;
        }
    }

    @PluginMethod
    public void executeCommand(PluginCall call) {
        String command = call.getString("command");
        List<String> args = call.getArray("args", new ArrayList<>()).toList();
        
        if (command == null) {
            call.reject("Command is required");
            return;
        }

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
            List<String> fullCommand = new ArrayList<>();
            fullCommand.add(command);
            fullCommand.addAll(args);
            
            ProcessBuilder pb = new ProcessBuilder(fullCommand);
            pb.directory(new File(currentWorkingDirectory));
            pb.environment().put("HOME", homeDirectory);
            pb.environment().put("TERM", "xterm-256color");
            pb.environment().put("LANG", "en_US.UTF-8");
            
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
            List<String> commandList = new ArrayList<>();
            commandList.add("su");
            commandList.add("-c");
            
            StringBuilder innerCommand = new StringBuilder(command);
            for (String arg : args) {
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
    public void getStorageInfo(PluginCall call) {
        try {
            JSObject result = new JSObject();
            
            // Internal storage
            File internal = Environment.getDataDirectory();
            StatFs internalStats = new StatFs(internal.getPath());
            long internalTotal = internalStats.getTotalBytes();
            long internalFree = internalStats.getAvailableBytes();
            
            JSObject internalStorage = new JSObject();
            internalStorage.put("path", internal.getAbsolutePath());
            internalStorage.put("total", internalTotal);
            internalStorage.put("free", internalFree);
            internalStorage.put("used", internalTotal - internalFree);
            result.put("internal", internalStorage);
            
            // External storage
            File external = Environment.getExternalStorageDirectory();
            if (external.exists() && external.canRead()) {
                StatFs externalStats = new StatFs(external.getPath());
                long externalTotal = externalStats.getTotalBytes();
                long externalFree = externalStats.getAvailableBytes();
                
                JSObject externalStorage = new JSObject();
                externalStorage.put("path", external.getAbsolutePath());
                externalStorage.put("total", externalTotal);
                externalStorage.put("free", externalFree);
                externalStorage.put("used", externalTotal - externalFree);
                result.put("external", externalStorage);
            }
            
            // App-specific directories
            JSObject appDirs = new JSObject();
            appDirs.put("files", getContext().getFilesDir().getAbsolutePath());
            appDirs.put("cache", getContext().getCacheDir().getAbsolutePath());
            appDirs.put("home", homeDirectory);
            appDirs.put("cwd", currentWorkingDirectory);
            result.put("app", appDirs);
            
            result.put("sdcard", storageRoot);
            
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to get storage info: " + e.getMessage());
        }
    }

    @PluginMethod
    public void listDirectory(PluginCall call) {
        String path = call.getString("path", currentWorkingDirectory);
        String resolvedPath = resolvePath(path);
        
        try {
            File dir = new File(resolvedPath);
            if (!dir.exists()) {
                JSObject result = new JSObject();
                result.put("error", "Directory not found: " + resolvedPath);
                result.put("files", new JSArray());
                call.resolve(result);
                return;
            }
            
            if (!dir.isDirectory()) {
                JSObject result = new JSObject();
                result.put("error", "Not a directory: " + resolvedPath);
                result.put("files", new JSArray());
                call.resolve(result);
                return;
            }
            
            File[] files = dir.listFiles();
            JSArray fileList = new JSArray();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US);
            
            if (files != null) {
                for (File file : files) {
                    JSObject fileInfo = new JSObject();
                    fileInfo.put("name", file.getName());
                    fileInfo.put("path", file.getAbsolutePath());
                    fileInfo.put("isDirectory", file.isDirectory());
                    fileInfo.put("isFile", file.isFile());
                    fileInfo.put("size", file.length());
                    fileInfo.put("modified", sdf.format(new Date(file.lastModified())));
                    fileInfo.put("readable", file.canRead());
                    fileInfo.put("writable", file.canWrite());
                    fileInfo.put("executable", file.canExecute());
                    fileList.put(fileInfo);
                }
            }
            
            JSObject result = new JSObject();
            result.put("path", resolvedPath);
            result.put("files", fileList);
            result.put("count", fileList.length());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to list directory: " + e.getMessage());
        }
    }

    @PluginMethod
    public void readFile(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        
        String resolvedPath = resolvePath(path);
        
        try {
            File file = new File(resolvedPath);
            if (!file.exists()) {
                call.reject("File not found: " + resolvedPath);
                return;
            }
            
            if (!file.canRead()) {
                call.reject("Cannot read file: " + resolvedPath);
                return;
            }
            
            // Limit file size to 10MB
            if (file.length() > 10 * 1024 * 1024) {
                call.reject("File too large (max 10MB)");
                return;
            }
            
            FileInputStream fis = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            fis.close();
            
            JSObject result = new JSObject();
            result.put("content", new String(data, "UTF-8"));
            result.put("path", resolvedPath);
            result.put("size", file.length());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to read file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void writeFile(PluginCall call) {
        String path = call.getString("path");
        String content = call.getString("content", "");
        Boolean append = call.getBoolean("append", false);
        
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        
        // Validate path doesn't contain traversal
        if (path.contains("..")) {
            call.reject("Invalid path: path traversal not allowed");
            return;
        }
        
        String resolvedPath = resolvePath(path);
        
        try {
            File file = new File(resolvedPath);
            File parent = file.getParentFile();
            
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            
            FileOutputStream fos = new FileOutputStream(file, append);
            fos.write(content.getBytes("UTF-8"));
            fos.close();
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("path", resolvedPath);
            result.put("size", file.length());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to write file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void deleteFile(PluginCall call) {
        String path = call.getString("path");
        Boolean recursive = call.getBoolean("recursive", false);
        
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        
        if (path.contains("..")) {
            call.reject("Invalid path: path traversal not allowed");
            return;
        }
        
        String resolvedPath = resolvePath(path);
        
        try {
            File file = new File(resolvedPath);
            if (!file.exists()) {
                call.reject("File not found: " + resolvedPath);
                return;
            }
            
            boolean success;
            if (file.isDirectory() && recursive) {
                success = deleteRecursive(file);
            } else {
                success = file.delete();
            }
            
            JSObject result = new JSObject();
            result.put("success", success);
            result.put("path", resolvedPath);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to delete: " + e.getMessage());
        }
    }

    private boolean deleteRecursive(File fileOrDirectory) {
        if (fileOrDirectory.isDirectory()) {
            File[] children = fileOrDirectory.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteRecursive(child);
                }
            }
        }
        return fileOrDirectory.delete();
    }

    @PluginMethod
    public void createDirectory(PluginCall call) {
        String path = call.getString("path");
        Boolean recursive = call.getBoolean("recursive", true);
        
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        
        if (path.contains("..")) {
            call.reject("Invalid path: path traversal not allowed");
            return;
        }
        
        String resolvedPath = resolvePath(path);
        
        try {
            File dir = new File(resolvedPath);
            boolean success = recursive ? dir.mkdirs() : dir.mkdir();
            
            JSObject result = new JSObject();
            result.put("success", success || dir.exists());
            result.put("path", resolvedPath);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to create directory: " + e.getMessage());
        }
    }

    @PluginMethod
    public void copyFile(PluginCall call) {
        String source = call.getString("source");
        String destination = call.getString("destination");
        
        if (source == null || destination == null) {
            call.reject("Source and destination are required");
            return;
        }
        
        if (source.contains("..") || destination.contains("..")) {
            call.reject("Invalid path: path traversal not allowed");
            return;
        }
        
        String resolvedSource = resolvePath(source);
        String resolvedDest = resolvePath(destination);
        
        try {
            File srcFile = new File(resolvedSource);
            File destFile = new File(resolvedDest);
            
            if (!srcFile.exists()) {
                call.reject("Source file not found: " + resolvedSource);
                return;
            }
            
            // Create parent directories if needed
            File parent = destFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            
            InputStream in = new FileInputStream(srcFile);
            OutputStream out = new FileOutputStream(destFile);
            
            byte[] buffer = new byte[1024];
            int length;
            while ((length = in.read(buffer)) > 0) {
                out.write(buffer, 0, length);
            }
            
            in.close();
            out.close();
            
            JSObject result = new JSObject();
            result.put("success", true);
            result.put("source", resolvedSource);
            result.put("destination", resolvedDest);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to copy file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void moveFile(PluginCall call) {
        String source = call.getString("source");
        String destination = call.getString("destination");
        
        if (source == null || destination == null) {
            call.reject("Source and destination are required");
            return;
        }
        
        if (source.contains("..") || destination.contains("..")) {
            call.reject("Invalid path: path traversal not allowed");
            return;
        }
        
        String resolvedSource = resolvePath(source);
        String resolvedDest = resolvePath(destination);
        
        try {
            File srcFile = new File(resolvedSource);
            File destFile = new File(resolvedDest);
            
            if (!srcFile.exists()) {
                call.reject("Source file not found: " + resolvedSource);
                return;
            }
            
            // Create parent directories if needed
            File parent = destFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            
            boolean success = srcFile.renameTo(destFile);
            
            JSObject result = new JSObject();
            result.put("success", success);
            result.put("source", resolvedSource);
            result.put("destination", resolvedDest);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to move file: " + e.getMessage());
        }
    }

    @PluginMethod
    public void changeDirectory(PluginCall call) {
        String path = call.getString("path");
        
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        
        String resolvedPath = resolvePath(path);
        
        try {
            File dir = new File(resolvedPath);
            if (!dir.exists()) {
                call.reject("Directory not found: " + resolvedPath);
                return;
            }
            
            if (!dir.isDirectory()) {
                call.reject("Not a directory: " + resolvedPath);
                return;
            }
            
            currentWorkingDirectory = dir.getCanonicalPath();
            
            JSObject result = new JSObject();
            result.put("path", currentWorkingDirectory);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to change directory: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getCurrentDirectory(PluginCall call) {
        JSObject result = new JSObject();
        result.put("path", currentWorkingDirectory);
        result.put("home", homeDirectory);
        call.resolve(result);
    }

    @PluginMethod
    public void getSystemInfo(PluginCall call) {
        try {
            JSObject result = new JSObject();
            
            // Device info
            result.put("manufacturer", Build.MANUFACTURER);
            result.put("model", Build.MODEL);
            result.put("device", Build.DEVICE);
            result.put("brand", Build.BRAND);
            result.put("hardware", Build.HARDWARE);
            
            // Android version
            result.put("androidVersion", Build.VERSION.RELEASE);
            result.put("sdkVersion", Build.VERSION.SDK_INT);
            
            // CPU info
            result.put("supportedAbis", Arrays.toString(Build.SUPPORTED_ABIS));
            
            // Memory info
            Runtime runtime = Runtime.getRuntime();
            result.put("maxMemory", runtime.maxMemory());
            result.put("totalMemory", runtime.totalMemory());
            result.put("freeMemory", runtime.freeMemory());
            
            // Paths
            result.put("homeDirectory", homeDirectory);
            result.put("currentDirectory", currentWorkingDirectory);
            result.put("externalStorage", storageRoot);
            
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to get system info: " + e.getMessage());
        }
    }

    @PluginMethod
    public void requestStoragePermission(PluginCall call) {
        if (hasStoragePermission()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
        } else {
            requestPermissionForAlias("storage", call, "storagePermissionCallback");
        }
    }

    @PermissionCallback
    private void storagePermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasStoragePermission());
        call.resolve(result);
    }

    private boolean hasStoragePermission() {
        return ContextCompat.checkSelfPermission(
            getContext(),
            Manifest.permission.READ_EXTERNAL_STORAGE
        ) == PackageManager.PERMISSION_GRANTED;
    }

    @PluginMethod
    public void installPackage(PluginCall call) {
        String packageName = call.getString("packageName");
        String source = call.getString("source", "auto");
        
        if (packageName == null) {
            call.reject("Package name is required");
            return;
        }

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
            String appDir = getContext().getFilesDir().getAbsolutePath();
            String linuxDir = appDir + "/linux";
            
            // Create comprehensive Linux directory structure
            String[] dirs = {
                linuxDir + "/bin",
                linuxDir + "/etc",
                linuxDir + "/home/cvj",
                linuxDir + "/tmp",
                linuxDir + "/var/log",
                linuxDir + "/var/tmp",
                linuxDir + "/usr/bin",
                linuxDir + "/usr/lib",
                linuxDir + "/usr/share",
                linuxDir + "/opt",
                linuxDir + "/root"
            };
            
            for (String dir : dirs) {
                new File(dir).mkdirs();
            }
            
            // Create basic config files
            String passwdContent = "root:x:0:0:root:/root:/bin/sh\ncvj:x:1000:1000:CVJ:/home/cvj:/bin/sh\n";
            FileOutputStream fos = new FileOutputStream(linuxDir + "/etc/passwd");
            fos.write(passwdContent.getBytes());
            fos.close();
            
            String profileContent = "export PATH=" + linuxDir + "/bin:" + linuxDir + "/usr/bin:$PATH\n" +
                "export HOME=" + linuxDir + "/home/cvj\n" +
                "export TERM=xterm-256color\n" +
                "export LANG=en_US.UTF-8\n" +
                "export PS1='cvj@terminalos:\\w$ '\n";
            fos = new FileOutputStream(linuxDir + "/etc/profile");
            fos.write(profileContent.getBytes());
            fos.close();
            
            // Update home directory
            homeDirectory = linuxDir + "/home/cvj";
            currentWorkingDirectory = homeDirectory;
            
            JSObject result = new JSObject();
            result.put("output", "Linux environment setup completed at: " + linuxDir);
            result.put("linuxRoot", linuxDir);
            result.put("home", homeDirectory);
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

        if (!url.startsWith("https://")) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Only HTTPS URLs are allowed for security");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        if (destination.contains("..")) {
            JSObject result = new JSObject();
            result.put("output", "");
            result.put("error", "Invalid destination path");
            result.put("exitCode", 1);
            call.resolve(result);
            return;
        }

        String resolvedDest = resolvePath(destination);

        try {
            URL downloadUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) downloadUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(30000);
            connection.setReadTimeout(30000);
            
            // Create parent directories
            File destFile = new File(resolvedDest);
            File parent = destFile.getParentFile();
            if (parent != null && !parent.exists()) {
                parent.mkdirs();
            }
            
            InputStream inputStream = connection.getInputStream();
            FileOutputStream outputStream = new FileOutputStream(destFile);
            
            byte[] buffer = new byte[4096];
            int bytesRead;
            long totalBytes = 0;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                totalBytes += bytesRead;
            }
            
            outputStream.close();
            inputStream.close();
            connection.disconnect();
            
            JSObject result = new JSObject();
            result.put("output", "Downloaded: " + url + " to " + resolvedDest + " (" + totalBytes + " bytes)");
            result.put("path", resolvedDest);
            result.put("size", totalBytes);
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
