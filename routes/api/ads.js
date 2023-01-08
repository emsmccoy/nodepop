const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const { Advertisement, tagsPermitted } = require('../../models/Advertisement');

//Route /api?...
router.get('/', Advertisement.dataValidator('get'), async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (error) {
    return res.status(422).json({ error: error.array() });
  }


  //Extracting the data for search
  let data = Advertisement.assingSearchData(req);

  try {
    const ads = await Advertisement.search(data.filters, data.skip, data.limit, data.sort, data.fields);
    res.json({ results: ads });
  } catch (error) {
    next(error);
  }
});

//Route api/tags --> Return tags permitted with the number of ads with this tag included
//next param is not going to be use. Deleted from the function call
router.get('/alltags', async (req, res) => {
  let filters = {};
  let results = {};

  for (let index = 0; index < tagsPermitted.length; index++) {
    const element = tagsPermitted[index];
    filters.tags = element;
    const tempResult = await Advertisement.search(filters);
    results[element] = tempResult.length;

  }

  res.json({ results: results });
});

//Router / method POST --> Save a new advertisement
//next param is not going to be use. Deleted from the function call
router.post('/', Advertisement.dataValidator('post'), async (req, res) => {
  //Data validation
  try {
    validationResult(req).throw();
  } catch (error) {
    return res.status(422).json({ error: error.array() });
  }

  //Tags format
  let tagsTemp;
  if (typeof (req.body.tags) === 'string') { tagsTemp = [req.body.tags]; }
  else { tagsTemp = req.body.tags; }

  //Model
  const ad = new Advertisement({
    nombre: req.body.nombre,
    venta: false || req.body.venta,
    precio: 0 || parseFloat(req.body.precio),
    foto: req.body.foto,
    tags: tagsTemp
  });

  //Saving document in DB
  try {
    const adCreated = await ad.save();
    res.status(201).json({ result: { id: adCreated.__id, msg: `Ad ${adCreated.nombre} succesfully created` } });
  } catch (error) {
    //If it's validation error, the object error has not array function.
    try {
      const fail = error.array();
      return res.status(422).json({ error: fail });
    } catch (err) {
      return res.status(422).json({ error: error });
    }
  }

});

module.exports = router;
