# Spring Boot应用Docker镜像
# 心理过程：使用多阶段构建优化镜像大小，采用非root用户提高安全性

FROM openjdk:17-jdk-slim as builder

WORKDIR /app
COPY pom.xml .
COPY src ./src

# 构建应用
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests && \
    mkdir -p target/dependency && \
    cd target/dependency && \
    jar -xf ../*.jar

# 运行阶段
FROM openjdk:17-jre-slim

# 创建非root用户
RUN groupadd -r spring && useradd -r -g spring spring

WORKDIR /app

# 复制jar包和依赖
COPY --from=builder --chown=spring:spring /app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=builder --chown=spring:spring /app/target/dependency/META-INF /app/META-INF
COPY --from=builder --chown=spring:spring /app/target/dependency/BOOT-INF/classes /app

USER spring

EXPOSE 8080

ENTRYPOINT ["java", "-cp", "app:app/lib/*", "com.aicommerce.AiEcommerceApplication"]