const dniService = require('../services/dni.service');
const { successResponse } = require('../utils/responseHandler');

class DniController {
  async getDni(req, res, next) {
    try {
      const { dni } = req.params;
      const data = await dniService.getDni(dni);
      return successResponse(res, data, 'Información de DNI recuperada correctamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DniController();
