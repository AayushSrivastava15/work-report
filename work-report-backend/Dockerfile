# Multi-stage Dockerfile for Spring Boot (Java 25)
FROM eclipse-temurin:25-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper & POM
COPY pom.xml mvnw ./
COPY .mvn .mvn/

# Resolve dependencies offline
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build production JAR
COPY src src/
RUN ./mvnw clean package -DskipTests -B

# Runtime Stage with minimal JRE footprint
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Create a non-privileged application user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Expose default HTTP port
EXPOSE 8080

# Configure JVM optimizations for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
