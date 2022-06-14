import express from 'express';
import bodyParser from 'body-parser';
import { isValidUrl, filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });

  //  End point to filteredimage
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  app.get('/filteredimage', async (req: express.Request, res: express.Response) => {
    //    1. validate the image_url query
    // get url from request and check it is valid url or not.
    const image_url = req.query['image_url'];
    const is_valid_url: Boolean = await isValidUrl(image_url);
    if (!is_valid_url) {
      return res.status(400).send(`Image url is not valid. Please check your url: ${image_url}`);
    } else {
      //    2. call filterImageFromURL(image_url) to filter the image
      const image_filtered = await filterImageFromURL(image_url);
      // Will check again is existed data from filterImageFromURL function.
      if (image_filtered) {
        // Will send response HTTP status 200 is OK from server
        //  3. send the resulting file in the response if had image_filtered
        res.status(200).sendFile(image_filtered, function (error: Error) {
          if (error) {
            return res.status(422).send(`Unprocessable Entity. Can not process  the file ${image_url}`);
          } else {
            //    4. deletes any files on the server on finish of the response
            // use try catch to catch IO Exception when delete file
            try {
              let arr: string[] = [image_filtered];
              deleteLocalFiles(arr);
            } catch (error) {
              console.log(error);
              return res.status(500).send(error);
            }
          }
        });
      }
    }
  });
})();