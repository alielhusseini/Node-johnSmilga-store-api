const Product = require('../models/products');

const getAllProductsStatic = async(req, res) => {
    //express-async-error took care of the try/catch, where in case of error we created a middleware that will catch it
    //throw new Error('testing async errors')

    //const products = await Product.find({}).sort('-name price')
    //const products = await Product.find({}).select('name price')
    //const products = await Product.find({}).sort('-name').limit(10).skip(10)
    const products = await Product.find({ price: { $gt: 30 } }).sort('-price').select('name price')
    res.status(200).json({ products, nbHits: products.length })
}

const getAllProducts = async(req, res) => {
    const { featured, name, company, sort, fields, numericFilters } = req.query // everything is a string
    const queryObject = {}

    // filter (based on the schema)
    if (featured) queryObject.featured = featured === 'true' ? true : false
    if (company)['ikea', 'liddy', 'caressa', 'marcos'].indexOf(company) > -1 ? queryObject.company = company : "" // no need to check since it's an enum with static values(just for try)
    if (name) queryObject.name = { $regex: name, $options: 'i' } // case insensitive, name must match exactly or must be containing what we are searching for
    if (numericFilters) {
        // 1st step: matching the operators to the mongoose query logic
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|<=|=|>|>=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`);
        // console.log(numericFilters,filters)
        // 2nd step: matching the keywords to the product's schema
        const options = ['price', 'rating']
        filters = filters.split(',').forEach(item => {
            const [field, operator, value] = item.split('-')
            if (options.includes(field)) {
                queryObject[field] = {
                    [operator]: Number(value)
                }
            }
        })
        console.log(queryObject);
    }
    // end filter

    let result = Product.find(queryObject) // 4:27:00 on why we removed the await (since we won't be able to chain the .sort(),..., since we awaited for all the data (the query isn't viable anymore), where without it, it's a buffer)

    // sort (mongoose method)
    if (sort) { // to sort maunally you add to the uri ?sort=variable, variable2... (- before the variable if in opp order)
        const sortList = sort.split(',').join(' ')
            //console.log(sortList)
        result = result.sort(sortList)
    } else {
        result = result.sort('createdAt')
    }
    // end sort

    // select (mongoose method)
    if (fields) { // you can name it anything you want, since you are the creator, just don't forget to mention it in the documentation
        const fieldsList = fields.split(',').join(' ')
            //console.log(sortList)
        result = result.select(fieldsList)
    }
    // end select

    // other chainings (mongoose method)
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit)
        // end chainings

    const products = await result
    res.status(200).json({ products, nbHits: products.length })
}

module.exports = { getAllProductsStatic, getAllProducts }


/*
 // With a JSON doc
Person.
  find({
    occupation: /host/,
    'name.last': 'Ghost',
    age: { $gt: 17, $lt: 66 },
    likes: { $in: ['vaporizing', 'talking'] }
  }).
  limit(10).
  sort({ occupation: -1 }).
  select({ name: 1, occupation: 1 }).
  exec(callback);

// Using query builder
Person.
  find({ occupation: /host/ }).
  where('name.last').equals('Ghost').
  where('age').gt(17).lt(66).
  where('likes').in(['vaporizing', 'talking']).
  limit(10).
  sort('-occupation').
  select('name occupation').
  exec(callback);
*/