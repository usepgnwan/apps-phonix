#!/usr/bin/env bash
# Ekstrak PostgreSQL custom dump (server lama) ke database/data/legacy/*.json
# untuk dikonsumsi LegacyProductionSeeder.
#
# Usage:
#   ./scripts/extract-legacy-dump.sh /path/to/dump-phonixapps-....sql
#
# Prasyarat: postgresql@17 (Homebrew) — pg_restore 14 tidak mendukung dump header 1.16.
set -euo pipefail

DUMP_PATH="${1:-$HOME/Downloads/dump-phonixapps-202607152025.sql}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/database/data/legacy"
PG17_BIN="${PG17_BIN:-/opt/homebrew/opt/postgresql@17/bin}"
PGPORT_TMP="${PGPORT_TMP:-55432}"
PGDATA_TMP="${PGDATA_TMP:-/tmp/phonix-legacy-pg17-extract}"
DB_NAME="phonixapps_legacy_extract"

if [[ ! -f "$DUMP_PATH" ]]; then
  echo "Dump tidak ditemukan: $DUMP_PATH" >&2
  exit 1
fi

if [[ ! -x "$PG17_BIN/pg_restore" ]]; then
  echo "pg_restore 17 tidak ditemukan di $PG17_BIN" >&2
  echo "Install: brew install postgresql@17" >&2
  exit 1
fi

cleanup() {
  if [[ -d "$PGDATA_TMP" ]]; then
    "$PG17_BIN/pg_ctl" -D "$PGDATA_TMP" stop -m fast >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "==> Init temp PostgreSQL 17 cluster on port $PGPORT_TMP"
rm -rf "$PGDATA_TMP"
"$PG17_BIN/initdb" -D "$PGDATA_TMP" --locale=en_US.UTF-8 -E UTF-8 --auth=trust >/tmp/legacy-extract-initdb.log 2>&1
echo "port = $PGPORT_TMP" >> "$PGDATA_TMP/postgresql.conf"
"$PG17_BIN/pg_ctl" -D "$PGDATA_TMP" -l /tmp/legacy-extract-pg17.log start
sleep 1
"$PG17_BIN/pg_isready" -p "$PGPORT_TMP" >/dev/null

echo "==> Restore dump"
"$PG17_BIN/createdb" -p "$PGPORT_TMP" "$DB_NAME"
"$PG17_BIN/pg_restore" -p "$PGPORT_TMP" -d "$DB_NAME" --no-owner --no-acl "$DUMP_PATH"

mkdir -p "$OUT_DIR"

TABLES=(
  positions teams users customer_profiles product_categories products services
  payment_methods vouchers lead_sources events leads lead_follow_ups field_activities
  bookings examinations product_recommendations orders order_items voucher_redemptions
  offline_sales offline_sale_items testimonials videos settings website_settings
)

echo "==> Export JSON ke $OUT_DIR"
for t in "${TABLES[@]}"; do
  "$PG17_BIN/psql" -p "$PGPORT_TMP" -d "$DB_NAME" -v ON_ERROR_STOP=1 -t -A -c \
    "SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (SELECT * FROM ${t}) t;" \
    > "$OUT_DIR/${t}.json"
  count="$(python3 -c "import json; print(len(json.load(open('$OUT_DIR/${t}.json'))))")"
  echo "  · ${t}: ${count}"
done

"$PG17_BIN/psql" -p "$PGPORT_TMP" -d "$DB_NAME" -t -A -c \
  "SELECT json_object_agg(relname, n_live_tup) FROM pg_stat_user_tables WHERE schemaname='public';" \
  > "$OUT_DIR/_meta_counts.json"

echo "==> Selesai. Lanjut:"
echo "    php artisan migrate:fresh"
echo "    php artisan db:seed --class=LegacyProductionSeeder"
