const int RED_BUTTON = 5;

bool lastButtonState = HIGH;

void setup() {
  Serial.begin(9600);
  pinMode(RED_BUTTON, INPUT_PULLUP);
}

void loop() {
  bool currentButtonState = digitalRead(RED_BUTTON);

  if (lastButtonState == HIGH && currentButtonState == LOW) {
    Serial.println("PAUSE");
  }

  lastButtonState = currentButtonState;

  delay(20);
}