
#include <Adafruit_NeoPixel.h>

#define LED_PIN 4
#define LED_COUNT 30

const int JOYSTICK_X = 2;
const int JOYSTICK_Y = 1;
const int BLUE_BUTTON = 4;
const int RED_BUTTON = 5;

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

bool lastButtonState = HIGH;
bool lastRedButtonState = HIGH;

int lives = 3;
String incomingCommand = "";

enum LedMode {
  MODE_LIVES,
  MODE_POWER,
  MODE_PAUSE,
  MODE_WIN,
  MODE_GAME_OVER
};

LedMode ledMode = MODE_LIVES;
LedMode previousLedMode = MODE_LIVES;

unsigned long lastJoystickRead = 0;
unsigned long lastBlink = 0;
unsigned long powerRemaining = 0;
unsigned long powerLastTick = 0;
unsigned long winStarted = 0;
unsigned long lastWinFrame = 0;

bool blinkOn = true;
int winFrame = 0;

void showLives() {
  if (lives >= 4) {
    for (int i = 0; i < LED_COUNT; i++) {
      strip.setPixelColor(i, strip.Color(
        (i * 37) % 256,
        (i * 73) % 256,
        (i * 109) % 256
      ));
    }
  } else {
    uint32_t color;

    if (lives == 3) {
      color = strip.Color(0, 255, 0);
    } else if (lives == 2 || lives == 1) {
      color = strip.Color(255, 90, 0);
    } else {
      color = strip.Color(255, 0, 0);
    }

    strip.fill(color);
  }

  strip.show();
}

void handleLedCommand(String cmd) {
  cmd.trim();

  if (cmd.startsWith("LIVES:")) {
    lives = cmd.substring(6).toInt();

    if (ledMode != MODE_GAME_OVER || lives > 0) {
      ledMode = MODE_LIVES;
      lastBlink = millis();
      blinkOn = true;
      showLives();
    }
  }
  else if (cmd.startsWith("POWER:")) {
    powerRemaining = cmd.substring(6).toInt();
    powerLastTick = millis();
    ledMode = MODE_POWER;
  }
  else if (cmd == "PAUSE") {
    if (ledMode != MODE_PAUSE) {
      previousLedMode = ledMode;
      ledMode = MODE_PAUSE;
    }
  }
  else if (cmd == "RESUME") {
    if (ledMode == MODE_PAUSE) {
      ledMode = previousLedMode;
      powerLastTick = millis();
      lastBlink = millis();
    }
  }
  else if (cmd == "LEVEL_COMPLETE") {
    ledMode = MODE_WIN;
    winStarted = millis();
    lastWinFrame = 0;
    winFrame = 0;
  }
  else if (cmd == "GAME_OVER") {
    ledMode = MODE_GAME_OVER;
    strip.fill(strip.Color(255, 0, 0));
    strip.show();
  }
}

void updateLeds() {
  unsigned long now = millis();

  if (ledMode == MODE_PAUSE || ledMode == MODE_GAME_OVER) {
    return;
  }

  if (ledMode == MODE_LIVES) {
    if (lives == 1 && now - lastBlink >= 400) {
      lastBlink = now;
      blinkOn = !blinkOn;

      strip.fill(blinkOn
        ? strip.Color(255, 90, 0)
        : strip.Color(0, 0, 0));

      strip.show();
    }
  }
  else if (ledMode == MODE_POWER) {
    unsigned long elapsed = now - powerLastTick;
    powerLastTick = now;

    if (elapsed >= powerRemaining) {
      powerRemaining = 0;
    } else {
      powerRemaining -= elapsed;
    }

    int ledsOn = (powerRemaining * LED_COUNT) / 8000;
    ledsOn = constrain(ledsOn, 0, LED_COUNT);

    strip.clear();

    for (int i = 0; i < ledsOn; i++) {
      strip.setPixelColor(i, strip.Color(0, 0, 255));
    }

    strip.show();

    if (powerRemaining == 0) {
      ledMode = MODE_LIVES;
      lastBlink = now;
      blinkOn = true;
      showLives();
    }
  }
  else if (ledMode == MODE_WIN) {
    if (now - lastWinFrame >= 100) {
      lastWinFrame = now;
      winFrame++;

      for (int i = 0; i < LED_COUNT; i++) {
        uint16_t hue = (i * 2000 + winFrame * 3000) % 65536;
        strip.setPixelColor(i, strip.gamma32(strip.ColorHSV(hue)));
      }

      strip.show();
    }

    if (now - winStarted >= 2000) {
      ledMode = MODE_LIVES;
      showLives();
    }
  }
}

void readJoystickAndButtons() {
  unsigned long now = millis();

  if (now - lastJoystickRead < 200) {
    return;
  }

  lastJoystickRead = now;

  int xValue = analogRead(JOYSTICK_X);
  int yValue = analogRead(JOYSTICK_Y);

  Serial.print("X=");
  Serial.print(xValue);
  Serial.print(" Y=");
  Serial.println(yValue);

  bool currentButtonState = digitalRead(BLUE_BUTTON);
  bool currentRedButtonState = digitalRead(RED_BUTTON);

  String direction = "CENTER";

    if (xValue > 3600) {
        direction = "RIGHT";
    }
    else if (xValue < 2400) {
        direction = "LEFT";
    }
    else if (yValue > 3600) {
        direction = "DOWN";
    }
    else if (yValue < 2400) {
        direction = "UP";
    }

  Serial.println(direction);

  if (lastButtonState == HIGH && currentButtonState == LOW) {
    Serial.println("START");
  }

  if (lastRedButtonState == HIGH && currentRedButtonState == LOW) {
    Serial.println("PAUSE");
  }

  lastButtonState = currentButtonState;
  lastRedButtonState = currentRedButtonState;
}

void setup() {
  Serial.begin(9600);

  pinMode(BLUE_BUTTON, INPUT_PULLUP);
  pinMode(RED_BUTTON, INPUT_PULLUP);

  strip.begin();
  strip.setBrightness(40);
  strip.clear();
  strip.show();

  showLives();
}

void loop() {
  // Read commands sent from the browser
  while (Serial.available()) {
    char c = Serial.read();

    if (c == '\n') {
      handleLedCommand(incomingCommand);
      incomingCommand = "";
    }
    else if (c != '\r' && incomingCommand.length() < 80) {
      incomingCommand += c;
    }
  }

  // Send joystick and button events to the browser
  readJoystickAndButtons();

  // Update LED animations
  updateLeds();

  delay(10);
}
