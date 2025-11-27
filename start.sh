#!/bin/sh
npx prisma generate
PORT=${PORT:-8080} npx next start -p $PORT
