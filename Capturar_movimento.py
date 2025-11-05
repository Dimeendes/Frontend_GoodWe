import serial
import json
from datetime import datetime
import requests
import time

# URL do webhook n8n
WEBHOOK_URL = "https://senador2006.app.n8n.cloud/webhook-test/7c5d0759-eeef-4694-8a18-6c06f87bd30b"

def enviar_para_webhook(dados):
    """Envia dados para o webhook n8n via POST"""
    try:
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(WEBHOOK_URL, json=dados, headers=headers, timeout=10)
        response.raise_for_status()  # Lança exceção se status code não for 2xx
        print(f"✓ Dados enviados com sucesso para o webhook. Status: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Erro ao enviar dados para o webhook: {e}")
        return False

conexao = ""
for porta in range(10):
    try:
        conexao = serial.Serial("COM"+str(porta), 9600)
        print("Conectado na porta: ", conexao.portstr)
        break
    except serial.SerialException:
        pass

if conexao != "":
    try:
        while True:
            resposta = conexao.readline()
            if resposta:
                resposta2 = resposta.decode('utf-8').strip()
                print(resposta2)
                
                # Verifica se é ON ou OFF (case insensitive)
                estado_limpo = resposta2.upper().replace('\r', '').replace('\n', '')
                
                if estado_limpo in ['ON', 'OFF']:
                    # Cria a estrutura JSON
                    dados = {
                        "timestamp": datetime.now().isoformat(),
                        "estado": estado_limpo,
                        "porta": conexao.portstr
                    }
                    
                    # Salva no arquivo JSON (backup local)
                    with open('movimento_dados.json', 'w') as arq:
                        json.dump(dados, arq, indent=2)
                    
                    # Envia para o webhook n8n
                    enviar_para_webhook(dados)
                    
                    print(f"✓ Processado: {estado_limpo}")
                    time.sleep(0.5)  # Pequeno delay para evitar spam
                    
    except KeyboardInterrupt:
        print("\nInterrompido pelo usuário")
    finally:
        conexao.close()
        print("Conexão encerrada")
else:
    print("Sem portas disponíveis")