import { NextFunction, Request, Response, Router } from "express";

export function wrapAllRoutes(router: Router): Router {
  router.stack.forEach((layer: any) => {
    if (layer.route) {
      layer.route.stack.forEach((routeLayer: any) => {
        const originalHandler = routeLayer.handle;

        routeLayer.handle = async (
          req: Request,
          res: Response,
          next: NextFunction
        ) => {
          try {
            const result = await originalHandler(req, res, next);

            if (!res.headersSent && result !== undefined) {
              const { status = 200, ...rest } = result;
              res.status(status).json({ statusCode: status, ...rest });
            }
          } catch (err) {
            next(err);
          }
        };
      });
    }
  });

  return router;
}
