#!/usr/bin/env bash

export TYPEORM_URL="postgres://root:123@localhost:5432/legacy"
export TYPEORM_ENTITIES="src/model/*.ts"
export TYPEORM_MIGRATIONS="src/migrations/*-*.ts"
export TYPEORM_MIGRATIONS_TABLE_NAME="eq_migrations"

yarn typeorm migration:generate -n $1 -d migration
