import { AppDataSource } from "./data-source";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";

AppDataSource.initialize()
  .then(async () => {
    // Create a new express application instance
    const app = express();

    // Call midlewares
    app.use(cors());
    app.use(helmet());
    app.use(bodyParser.json());

    //Set all routes from routes folder
    app.use("/", routes);

    app.listen(8080, () => {
      console.log("Server started on port 8080!");
    });
  })
  .catch((error) => console.log(error));
