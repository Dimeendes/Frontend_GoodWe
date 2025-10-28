import serial
import json
from datetime import datetime
import re

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
                    
                    # Salva no arquivo JSON
                    with open('movimento_dados.json', 'w') as arq:
                        json.dump(dados, arq, indent=2)
                    
                    print(f"✓ Salvou: {estado_limpo}")
                    
    except KeyboardInterrupt:
        print("\nInterrompido pelo usuário")
    finally:
        conexao.close()
        print("Conexão encerrada")
else:
    print("Sem portas disponíveis")