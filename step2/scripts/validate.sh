#!/usr/bin/env bash
curl http://127.0.0.1:3001/ledger/validate 1>/dev/null 2>/dev/null &
curl http://127.0.0.2:3002/ledger/validate 1>/dev/null 2>/dev/null &
curl http://127.0.0.3:3003/ledger/validate 1>/dev/null 2>/dev/null &
curl http://127.0.0.4:3004/ledger/validate 1>/dev/null 2>/dev/null &
curl http://127.0.0.5:3005/ledger/validate 1>/dev/null 2>/dev/null &