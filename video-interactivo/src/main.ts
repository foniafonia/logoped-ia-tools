import "./styles/main.css";
import { App } from "./app/App";

const mount = document.getElementById("app");
if (!mount) {
  throw new Error("No se encontro el contenedor #app.");
}

const app = new App(mount);
void app.init();
