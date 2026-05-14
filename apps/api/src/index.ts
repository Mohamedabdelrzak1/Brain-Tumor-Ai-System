import createApp from "./app";

const rawPort = process.env["PORT"];

const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const app = createApp();

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
