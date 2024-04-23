FROM node:20
WORKDIR /app
COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma
RUN npm install

# Atualize os pacotes e instale o PostgreSQL
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get update -q \
    && apt-get install -y -q postgresql postgresql-contrib

# Defina as variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production
ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_USERNAME=postgres
ENV DB_PASSWORD=postgres
ENV DB_DATABASE=verticalLogistica
ENV DB_TYPE=postgres
ENV DATABASE_URL="postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_DATABASE?schema=public"

RUN service postgresql start && \
    su postgres -c 'createdb verticalLogistica' && \
    su - postgres -c "psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres';\""

RUN sleep 5

EXPOSE $PORT

RUN npm run build
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

WORKDIR /app

# Execute a aplicação quando o contêiner for iniciado
CMD ["/app/start.sh"]
