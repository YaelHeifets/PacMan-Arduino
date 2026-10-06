const int BLUE_BUTTON = 4;

bool lastButtonState = HIGH;

void setup() {
  Serial.begin(9600);
  pinMode(BLUE_BUTTON, INPUT_PULLUP);
}

void loop() {
  bool currentButtonState = digitalRead(BLUE_BUTTON);

  if (lastButtonState == HIGH && currentButtonState == LOW) {
    Serial.println("START");
  }

  lastButtonState = currentButtonState;

  delay(20);
}