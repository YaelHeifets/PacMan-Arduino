const int JOYSTICK_X = 2;
const int JOYSTICK_Y = 1;
const int BLUE_BUTTON = 4;

bool lastButtonState = HIGH;

void setup() {
  Serial.begin(9600);
  pinMode(BLUE_BUTTON, INPUT_PULLUP);
}

void loop() {
  int xValue = analogRead(JOYSTICK_X);
  int yValue = analogRead(JOYSTICK_Y);
  bool currentButtonState = digitalRead(BLUE_BUTTON);

  String direction = "CENTER";

  if (xValue > 3000) {
    direction = "RIGHT";
  }
  else if (xValue < 1000) {
    direction = "LEFT";
  }
  else if (yValue > 3000) {
    direction = "DOWN";
  }
  else if (yValue < 1000) {
    direction = "UP";
  }

  Serial.println(direction);

  delay(200);
  if (lastButtonState == HIGH && currentButtonState == LOW) {
    Serial.println("START");
  }

  lastButtonState = currentButtonState;

  delay(20);
}
