#!/bin/bash
# Execute este script UMA vez na raiz do projeto.
# Ele gera um certificado autoassinado válido por 365 dias
# e copia para a pasta certs/ de cada serviço.

set -e

echo "Gerando certificado autoassinado..."

mkdir -p certs-base

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs-base/key.pem \
  -out    certs-base/cert.pem \
  -days   365 \
  -subj   "/C=BR/ST=PR/L=CornelioProcopio/O=CineSearch/CN=localhost"

echo "Copiando para cada serviço..."

for SERVICE in auth-service resource-service notification-service; do
  mkdir -p "$SERVICE/certs"
  cp certs-base/key.pem  "$SERVICE/certs/key.pem"
  cp certs-base/cert.pem "$SERVICE/certs/cert.pem"
  echo "  -> $SERVICE/certs/ OK"
done

echo ""
echo "Certificado gerado com sucesso!"
echo "Lembre-se de aceitar o aviso de segurança no navegador ao abrir https://localhost"