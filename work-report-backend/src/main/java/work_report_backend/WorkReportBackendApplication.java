package work_report_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class WorkReportBackendApplication {

	public static void main(String[] args) {
		loadEnvironmentVariables();
		SpringApplication.run(WorkReportBackendApplication.class, args);
	}

	private static void loadEnvironmentVariables() {
		List<Path> candidatePaths = List.of(
				Paths.get(".env"),
				Paths.get("..", ".env"),
				Paths.get(System.getProperty("user.dir", "."), ".env"),
				Paths.get(System.getProperty("user.dir", "."), "..", ".env")
		);

		for (Path envPath : candidatePaths) {
			if (Files.exists(envPath) && !Files.isDirectory(envPath)) {
				try {
					List<String> lines = Files.readAllLines(envPath);
					for (String line : lines) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) {
							continue;
						}
						int eqIdx = line.indexOf('=');
						if (eqIdx > 0) {
							String key = line.substring(0, eqIdx).trim();
							String value = line.substring(eqIdx + 1).trim();
							if ((value.startsWith("\"") && value.endsWith("\"")) ||
								(value.startsWith("'") && value.endsWith("'"))) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("[WorkReport] Successfully loaded environment variables from " + envPath.toAbsolutePath().normalize());
					break;
				} catch (Exception e) {
					System.err.println("[WorkReport] Failed to load .env from " + envPath + ": " + e.getMessage());
				}
			}
		}
	}

}

