/*
  Automação de Lâmpada com Sensor PIR
  Integração com SmartWe Dashboard
  
  Hardware:
  - Sensor PIR conectado ao pino 2
  - LED integrado no pino 13 (ou LED externo)
  - Conectado ao computador via USB
  
  Funcionamento:
  - Detecta movimento via sensor PIR
  - Liga LED quando detecta movimento
  - Envia "ON" via Serial quando detecta movimento
  - Envia "OFF" via Serial quando para de detectar
  - Comunica com SmartWe Dashboard em tempo real
*/

// Define os pinos
const int sensorPin = 2;    // PIR sensor (OUT)
const int ledPin = 13;      // LED integrado ou externo

// Estado atual e último estado
int sensorState = LOW;
int lastState = LOW;

// Controle de tempo para debounce
unsigned long lastChange = 0;
const unsigned long debounceDelay = 200; // ms

// Controle de tempo para desligar automaticamente
unsigned long motionDetectedTime = 0;
const unsigned long autoOffDelay = 3000; // 3 segundos

// Flag para controlar se deve desligar automaticamente
bool shouldAutoOff = true;

void setup() {
  // Configurar pinos
  pinMode(ledPin, OUTPUT);
  pinMode(sensorPin, INPUT);
  
  // Inicializar comunicação serial
  Serial.begin(115200);
  
  // Aguardar conexão serial (opcional)
  // while (!Serial) {
  //   ; // Aguarda conexão serial
  // }
  
  // Estado inicial
  digitalWrite(ledPin, LOW);
  
  // Mensagem de inicialização
  Serial.println("SmartWe Arduino iniciado");
  Serial.println("Sensor PIR no pino 2");
  Serial.println("LED no pino 13");
  Serial.println("Taxa: 115200 bps");
  Serial.println("Pronto para detectar movimento...");
}

void loop() {
  int reading = digitalRead(sensorPin);
  unsigned long currentTime = millis();

  // Verificar mudança de estado com debounce
  if (reading != lastState && (currentTime - lastChange) > debounceDelay) {
    lastChange = currentTime;
    lastState = reading;

    if (reading == HIGH) {
      // Movimento detectado
      digitalWrite(ledPin, HIGH);
      Serial.println("ON");
      motionDetectedTime = currentTime;
      
      // Log para debug
      Serial.print("Movimento detectado às ");
      Serial.println(currentTime);
      
    } else {
      // Movimento parou
      if (shouldAutoOff) {
        digitalWrite(ledPin, LOW);
        Serial.println("OFF");
        
        // Log para debug
        Serial.print("Movimento parou às ");
        Serial.println(currentTime);
      }
    }
  }

  // Auto-desligamento após tempo determinado
  if (shouldAutoOff && sensorState == HIGH && (currentTime - motionDetectedTime) > autoOffDelay) {
    digitalWrite(ledPin, LOW);
    Serial.println("OFF");
    sensorState = LOW;
    
    // Log para debug
    Serial.print("Auto-desligamento após ");
    Serial.print(autoOffDelay);
    Serial.println(" ms");
  }

  // Atualizar estado atual
  sensorState = digitalRead(ledPin) == HIGH ? HIGH : LOW;

  // Pequeno delay para estabilidade
  delay(50);
}

/*
  Instruções de Upload:
  
  1. Conecte o Arduino ao computador via USB
  2. Abra o Arduino IDE
  3. Selecione a placa correta (Arduino Uno, Nano, etc.)
  4. Selecione a porta COM correta
  5. Faça upload deste código
  6. Abra o Monitor Serial (Ctrl+Shift+M)
  7. Configure para 115200 bps
  8. Teste movimentando a mão na frente do sensor PIR
  
  Conexões do Hardware:
  
  Sensor PIR:
  - VCC -> 5V do Arduino
  - GND -> GND do Arduino
  - OUT -> Pino 2 do Arduino
  
  LED (opcional):
  - Ânodo -> Pino 13 do Arduino
  - Cátodo -> GND via resistor 220Ω
  
  O LED integrado no pino 13 também funcionará automaticamente.
  
  Teste:
  - Movimente a mão na frente do sensor PIR
  - O LED deve acender e "ON" deve aparecer no monitor
  - Após 3 segundos, deve desligar e "OFF" deve aparecer
  - No SmartWe Dashboard, a lâmpada deve ligar/desligar automaticamente
*/