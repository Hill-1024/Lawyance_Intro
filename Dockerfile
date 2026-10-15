# 介绍页静态服务镜像。
#
# 只装 server/serve.py：它纯标准库（ThreadingHTTPServer），既不需要 Node 也不需要 pnpm。
# 页面产物不在镜像里——宿主上跑 tools/build.sh 把产物放进 releases/<时间戳>/，
# 再把整个仓库根只读挂进来（见主仓 deploy/docker/compose.yml）。
# 这样保留了现有零停机换版：serve.py 每个请求重新解析 current 符号链接，换个版本
# 不需要重启容器，也不需要重建镜像。
FROM python:3.13-alpine

WORKDIR /app
COPY server ./server

ENV PYTHONUNBUFFERED=1 \
    LAWVER_INTRO_HOST=0.0.0.0 \
    LAWVER_INTRO_PORT=8082 \
    LAWVER_INTRO_ROOT=/intro/current

EXPOSE 8082

# 只读静态文件，不需要任何特权
USER nobody

CMD ["python", "server/serve.py"]
