# Documentação da API Webhook - Captura de Movimento

## Visão Geral

Este documento descreve o formato dos dados enviados via POST para o webhook do n8n que captura informações de movimento a partir de uma porta serial (COM).

## Endpoint

**URL:** `https://senador2006.app.n8n.cloud/webhook-test/7c5d0759-eeef-4694-8a18-6c06f87bd30b`  
**Método:** `POST`  
**Content-Type:** `application/json`

## Estrutura dos Dados

O webhook recebe um objeto JSON com os seguintes campos:

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `timestamp` | string (ISO 8601) | Data e hora do evento em formato ISO 8601 | `"2025-10-27T10:35:19.240854"` |
| `estado` | string | Estado do sensor de movimento. Pode ser `"ON"` ou `"OFF"` | `"ON"` ou `"OFF"` |
| `porta` | string | Identificação da porta serial utilizada (COM1, COM2, etc.) | `"COM5"` |

## Exemplo de Requisição

### Headers
```http
POST /webhook-test/7c5d0759-eeef-4694-8a18-6c06f87bd30b HTTP/1.1
Host: senador2006.app.n8n.cloud
Content-Type: application/json
```

### Body (JSON)

#### Quando o sensor detecta movimento (ON):
```json
{
  "timestamp": "2025-10-27T10:35:19.240854",
  "estado": "ON",
  "porta": "COM5"
}
```

#### Quando o sensor não detecta movimento (OFF):
```json
{
  "timestamp": "2025-10-27T10:36:45.123456",
  "estado": "OFF",
  "porta": "COM5"
}
```

## Detalhes dos Campos

### `timestamp`
- **Tipo:** String (ISO 8601)
- **Formato:** `YYYY-MM-DDTHH:MM:SS.ffffff`
- **Descrição:** Timestamp do momento em que o evento foi capturado, no formato ISO 8601 com microsegundos
- **Exemplo:** `"2025-10-27T10:35:19.240854"`

### `estado`
- **Tipo:** String (enum)
- **Valores possíveis:** `"ON"` ou `"OFF"`
- **Descrição:** 
  - `"ON"`: Sensor detectou movimento
  - `"OFF"`: Sensor não detecta movimento
- **Case-insensitive na origem:** O sistema converte automaticamente para maiúsculas antes de enviar

### `porta`
- **Tipo:** String
- **Formato:** `"COM"` seguido de número (ex: COM1, COM2, COM5)
- **Descrição:** Identificação da porta serial onde o sensor está conectado
- **Exemplo:** `"COM5"`

## Comportamento do Sistema

1. **Leitura Contínua:** O sistema lê continuamente dados da porta serial
2. **Filtragem:** Apenas dados que correspondem a `"ON"` ou `"OFF"` são processados
3. **Normalização:** Todos os dados são normalizados para maiúsculas antes do processamento
4. **Envio Imediato:** Cada evento válido é enviado imediatamente para o webhook
5. **Backup Local:** Além do envio ao webhook, os dados também são salvos localmente em `movimento_dados.json`

## Códigos de Resposta HTTP

O webhook deve retornar os seguintes códigos HTTP:

- **200 OK:** Dados recebidos e processados com sucesso
- **400 Bad Request:** Formato de dados inválido
- **500 Internal Server Error:** Erro no processamento no servidor

## Tratamento de Erros

O sistema cliente implementa tratamento de erros para:
- **Timeout:** 10 segundos para receber resposta
- **Erros de conexão:** Log de erro e continua operação
- **Dados inválidos:** Apenas dados válidos (`ON`/`OFF`) são enviados

## Frequência de Envios

- **Frequência:** Eventos são enviados conforme detectados na porta serial
- **Rate Limiting:** O sistema implementa um delay de 0.5 segundos entre envios para evitar spam
- **Não há garantia de ordem:** Eventos podem chegar fora de ordem se houver problemas de rede

## Segurança

- **HTTPS:** O webhook utiliza HTTPS para comunicação segura
- **Sem autenticação:** O webhook atual não requer autenticação (URL pública)
- **Validação:** Recomenda-se validar os dados recebidos no n8n

## Exemplo de Uso no n8n

Ao configurar o n8n para receber estes dados, você pode acessar os campos assim:

```javascript
// Exemplo de acesso aos dados no n8n
const timestamp = $json.timestamp;  // "2025-10-27T10:35:19.240854"
const estado = $json.estado;        // "ON" ou "OFF"
const porta = $json.porta;          // "COM5"
```

## Dependências do Sistema Cliente

O código Python que envia os dados requer:
- `pyserial`: Para comunicação serial
- `requests`: Para requisições HTTP
- Python 3.6+

## Logs e Debugging

O sistema cliente gera logs para:
- ✓ Conexão estabelecida na porta serial
- ✓ Dados enviados com sucesso
- ✗ Erros ao enviar dados
- ✗ Interrupções do usuário


