import * as vscode from "vscode";
import dockerNames from "docker-names";
import { v4 as uuidv4 } from "uuid";

// Get or generate a unique UUID for the installation
export async function getExtensionUUID(): Promise<string | null> {
  try {
    const newUUID = uuidv4();
    const randomName = dockerNames.getRandomName();
    const uid = randomName + "_" + newUUID;

    return uid;
  } catch (e) {
    console.log("error during extuid: ", e);
    return null;
  }
}
