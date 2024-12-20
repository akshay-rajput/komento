import { EventEmitter } from "events";
const eventEmitter = new EventEmitter();

export function calculateSum(a: number, b: number): number {
  function multiplyByTwo(x: number): number {
    return x * 2;
  }

  const incrementByOne = (y: number): number => {
    return y + 1;
  };

  const decrementByOne = function (z: number): number {
    return z - 1;
  };

  return multiplyByTwo(a) + incrementByOne(b);
}

const greetUser = (name: string): string => {
  return `Hello, ${name}`;
};

const toggleBoolean = function (value: boolean): boolean {
  return !value;
};

class Calculator {
  public concatenateStrings(first: string): string {
    const addSuffix = (suffix: string): string => {
      return `${first} ${suffix}`;
    };

    return addSuffix("world");
  }

  get constantValue(): number {
    return 42;
  }

  set constantValue(value: number) {
    console.log(`New value set: ${value}`);
  }
}

(function logImmediateMessage() {
  console.log("This message is logged immediately");
})();

function logStaticMessage(): void {
  console.log("Logging a static message");
}

function addWithDefaults(a: number = 10, b: number = 20): number {
  return a + b;
}

eventEmitter.on("click", function (event) {
  console.log("Simulated click event!", event);
});

eventEmitter.on("keydown", (event) => {
  console.log("Simulated key press:", event.key);
});