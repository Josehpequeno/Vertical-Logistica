#!/bin/bash

service postgresql start

sleep 5

cd /app

npx prisma generate
npx prisma migrate dev

node ./dist/app.js