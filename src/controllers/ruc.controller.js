const rucService = require('../services/ruc.service');
const { successResponse } = require('../utils/responseHandler');

class RucController {
  async getRuc(req, res, next) {
    try {
      const { ruc } = req.params;
      const data = await rucService.getRuc(ruc);
      return successResponse(res, data, 'Información de RUC recuperada correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RucController();
