# Sistema de Controle de Lâmpada via Sensor PIR

## 📋 Como Funciona

A lâmpada na aba "Aparelhos" é controlada automaticamente através do sensor PIR do Arduino, que detecta movimento e envia sinais "ON" ou "OFF" via porta serial.

## 🔄 Fluxo de Funcionamento

### 1. Arduino + Sensor PIR
- O sensor PIR detecta movimento
- Envia "ON" quando detecta movimento
- Envia "OFF" quando não há movimento

### 2. Script Python (`Capturar_movimento.py`)
- Lê os dados da porta serial do Arduino
- Salva os estados em `movimento_dados.json`
- Formato do arquivo:
```json
{
  "timestamp": "2025-10-27T10:00:00",
  "estado": "ON",
  "porta": "COM5"
}
```

### 3. API Backend (`/api/aparelhos`)
- Lê o arquivo `movimento_dados.json`
- Identifica se o último estado é "ON" ou "OFF"
- Define o status da lâmpada (`is_on: 1` para ON, `is_on: 0` para OFF)

### 4. Interface Web (`/aparelhos`)
- Mostra o status da lâmpada em tempo real
- Atualiza automaticamente a cada 2 segundos
- Indicador visual:
  - 🟢 Verde + "Ligado" quando `estado: "ON"`
  - 🔴 Vermelho + "Desligado" quando `estado: "OFF"`

## 🚀 Como Usar

### 1. Conectar o Arduino
```bash
# Conecte o Arduino via USB
# Certifique-se de que está na porta COM5 (ou ajuste no código)
```

### 2. Executar o Script de Captura
```bash
python Capturar_movimento.py
```

### 3. Acessar a Interface
- Abra o navegador em `http://localhost:3000/aparelhos`
- A lâmpada aparecerá com o status atual

## 📊 Formato dos Dados

O arquivo `movimento_dados.json` pode ter três formatos:

### Formato 1: Objeto com timestamp
```json
{
  "timestamp": "2025-10-27T10:00:00",
  "estado": "ON",
  "porta": "COM5"
}
```

### Formato 2: Array de objetos
```json
[
  {
    "timestamp": "2025-10-27T10:00:00",
    "estado": "ON",
    "porta": "COM5"
  }
]
```

### Formato 3: String simples (compatibilidade)
```json
"OFF\r\n"
```

## 🔧 Configurações

### Velocidade de Atualização
O status da lâmpada é atualizado automaticamente a cada **2 segundos**.

Para alterar, edite `app/aparelhos/page.js`:
```javascript
const interval = setInterval(() => {
  loadAparelhos();
}, 2000); // Altere 2000 (ms) para o valor desejado
```

### Porta do Arduino
Edite `Capturar_movimento.py` se o Arduino não estiver na COM5.

## ⚠️ Notas Importantes

1. O arquivo `movimento_dados.json` é gerado automaticamente pelo script Python
2. O script deve estar rodando para capturar as mudanças do Arduino
3. A interface web atualiza automaticamente, não precisa recarregar a página
4. Se o arquivo não existir, a lâmpada será exibida como "Desligada" (OFF)

## 🐛 Solução de Problemas

### Lâmpada não atualiza
- Verifique se o script `Capturar_movimento.py` está rodando
- Verifique se o Arduino está conectado
- Verifique se o arquivo `movimento_dados.json` existe

### Arquivo JSON inválido
- O script corrigido agora salva em formato JSON válido
- Se houver problemas, delete o arquivo e deixe o script recriar

### Status incorreto
- Verifique o conteúdo de `movimento_dados.json`
- O campo `estado` deve ser "ON" ou "OFF" (case insensitive)

