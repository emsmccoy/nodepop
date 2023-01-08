'use strict';
const mongoose = require("mongoose");
const { query, body } = require('express-validator');

//Tags permitted
const tagsPermitted = ['lifestyle', 'work', 'mobile', 'motor'];

//advertisement schema
const adsSquema = mongoose.Schema({
  item: { type: String, required: true },
  sale: { type: Boolean, required: true },
  price: { type: Number, required: true },
  photo: { type: String, required: true },
  tags: {
    type: [String],
    required: true,
    validate: {
      //Validaton function for tags in tagsPermitted
      validator: function (tags) {
        let ok = true;
        tags.forEach(element => {
          ok = ok && tagsPermitted.includes(element);
        });
        return ok;
      },
      message: `Please, type one or more tags. Values allowed: ${tagsPermitted}`
    }
  }
});

//DB Indexes
adsSquema.index({ item: 1 });
adsSquema.index({ item: -1 });
adsSquema.index({ price: 1 });
adsSquema.index({ price: -1 });
adsSquema.index({ sale: 1 });
adsSquema.index({ sale: -1 });
adsSquema.index({ tags: 1 });
adsSquema.index({ tags: -1 });

/**
 * Search in DB Collection, applying filters, pagination, sort and 
 * fields selected.
 * @param {object} filters Possible filters: item, sale, price, tag
 * @param {integer} skip Show result from skip+1
 * @param {integer} limit Show only "limit" results
 * @param {string} sort Sort results by: item, sale, price
 * @param {string} fields Show only the indicated fields
 * @returns Object JSON containing the search results in DB
 */
adsSquema.statics.search = function (filters, skip, limit, sort, fields) {
  const query = Advertisement.find(filters);

  query.skip(skip);
  query.limit(limit);
  query.sort(sort);
  query.select(fields);
  return query.exec();
};

/**
 * This functions makes the data validation by query string for the adsSchema to use with express-validator.  
 * It will check the GET or POST method of transmission (query or body)
 * @param {String} method Method utilised to pass the data. 'get' or 'post'
 * @returns express-validator results for the adsSchema
 */
adsSquema.statics.dataValidator = function (method) {
  //GET fields in query
  if (method === 'get') {
    return [
      query('item').if(query('item').exists()).isString().toLowerCase()
        .withMessage('item must be an string'),
      query('sale').if(query('sale').exists()).isBoolean()
        .withMessage('sale must be true or false'),
      //Search fields
      query('tag').if(query('tag').exists()).toLowerCase().isIn(['work', 'lifestyle', 'mobile', 'motor'])
        .withMessage('You must indicate just one word (work, lifestyle, mobile or motor) to find a tag'),
      query('price').if(query('price').exists()).custom(value => {
        const rexExpPattern = new RegExp('([0-9]{1,7}-[0-9]{1,7}|[0-9]{1,7}-|[0-9]{1,7}|-[0-9]{1,7}){1}');
        return rexExpPattern.test(value);
      }).withMessage('price must follow the pattern ([0-9]{1,7}-[0-9]{1,7}|[0-9]{1,7}-|[0-9]{1,7}|-[0-9]{1,7}){1}'),

      //Pagination fields
      query('skip').if(query('skip').exists()).isInt()
        .withMessage('skip must be an integer number'),
      query('limit').if(query('limit').exists()).isInt()
        .withMessage('limit must be an integer number'),
      //Sort field
      query('sort').if(query('sort').exists()).toLowerCase()
        .isIn(['item', '-item', 'price', '-price', 'sale', '-sale'])
        .withMessage('fields used for sorting include: (-)item, (-)price o (-)sale')
    ];
  }
  //Post fields
  if (method === 'post') {
    return [
      body('item').isString().toLowerCase().withMessage('item must exist and be an string'),
      body('sale').isBoolean().withMessage('sale must exist and be true or false'),
      body('price').isFloat().withMessage('price must exist and must be integer or float'),
      body('photo').toLowerCase().custom(value => {
        const name = value.split('.');
        return (false || name[name.length - 1] === 'jpg' || name[name.length - 1] === 'jpeg' || name[name.length - 1] === 'png');
      }).withMessage('photo file must be an jpg, jpeg or png format'),
      body('tags').custom(value => {
        return false || typeof (value) === 'string' || Array.isArray(value);
      })
        .withMessage(`tags must be an array of strings containing one or several of ${tagsPermitted}`)
    ];
  }
};

/**
 * Function to prepare price integer filter query to be use in mongoDB.
 * 
 * This function is only for internal use
 * @param {string} price String
 * @returns integer or object
 * 
 * This function receips one string containing:  
 *  one number;  
 *  two numbers, separates by '-' without spaces;  
 *  one number before '-' without spaces;  
 *  one number after '-' without spaces.  
 *   
 * Returns:  
 * If price is one number, the function returns the number in integer format;  
 * If price are two numbers --> objetct containig
 *  {$gte: first number, $lte: second number};  
 * If price is number+'-' --> object {$gte: number};  
 * If price is '-'+number --> object {$lte: number}
 */
function priceFilter(price) {
  if (price) {
    let query;
    let limits = price.split('-');

    if (limits.length === 1) { query = parseInt(limits[0]); }
    else {
      query = {};
      if (limits[0] !== '') {
        query = { $gte: parseInt(limits[0]) };
      }
      if (limits[1] !== '') {
        query.$lte = parseInt(limits[1]);
      }
    }
    return query;
  }
}

/**
 * Static method
 * Take from the request the necessary data for prepare filters,
 * pagination, sort, limits and skip, to be use in the search
 * function of the model.
 * @param {object} req Web Request
 * @returns objetc containing the results to apply for searching in DB.
 */
adsSquema.statics.assingSearchData = function (req) {
  let data = {};

  //Filter assing
  let filters = {};
  if (req.query.item) {
    filters.item = { '$regex': req.query.item.toLowerCase(), '$options': 'i' };
  }
  if (req.query.tag) {
    filters.tags = req.query.tag.toLowerCase();
  }
  if (req.query.sale) { filters.sale = req.query.sale; }
  if (req.query.price) { filters.price = priceFilter(req.query.price); }

  data.filters = filters;

  //Pagination
  data.skip = req.query.skip;
  data.limit = req.query.limit;

  //Sort
  data.sort = req.query.sort;

  //Fields
  data.fields = req.query.fields;

  return data;
};

// Creating model
const Advertisement = mongoose.model('Advertisement', adsSquema);

//Exporting model
module.exports = { Advertisement, tagsPermitted };