FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace
COPY . .
RUN chmod +x gradlew && ./gradlew --no-daemon clean bootJar

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]


