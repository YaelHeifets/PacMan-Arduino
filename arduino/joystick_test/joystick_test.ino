const int JOYSTICK_X = 2;
const int JOYSTICK_Y = 1;

void setup() {
  Serial.begin(9600);
}

void loop() {
  int xValue = analogRead(JOYSTICK_X);
  int yValue = analogRead(JOYSTICK_Y);

  Serial.print("X: ");
  Serial.print(xValue);

  Serial.print(" | Y: ");
  Serial.println(yValue);

  delay(200);
}