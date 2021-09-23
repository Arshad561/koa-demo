const Koa = require('koa');
const route = require('koa-route');
var parse = require('co-body');
const logger = require('pino')();
const pino = require('koa-pino-logger')('koa-demo');

const db = require('./db.js');
const Person = require('./person.js');

const app = new Koa();

app.context.arshad = 'arshad';

app.use(pino);

app.use(async (ctx, next) => {
  ctx.log.info('first middleware');
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(route.get('/persons', getPersons));
app.use(route.post('/persons', addPerson));
app.use(route.patch('/persons/:id', updatePerson))
app.use(route.delete('/persons/:id', deletePerson));

async function getPersons(ctx, next) {
  try {
    const persons = await Person.find();
    ctx.body = persons;
    next();
  } catch (err) {
    ctx.throw(400, err);
  }
}

async function addPerson(ctx, next) {
  try {
    const data = await parse(this);
    const person = new Person(data);
    let createdPerson = await person.save();
    ctx.status = 201;
    ctx.body = createdPerson;
    next();
  } catch (err) {
    ctx.throw(400, err);
  }
}

async function updatePerson(ctx, id, next) {
  try {
    const data = await parse(this);
    const updatedPerson = await Person.findByIdAndUpdate(id, data, {new : true});
    ctx.status = 201;
    ctx.body = updatedPerson;
    next();
  } catch (err) {
    ctx.throw(400, err);
  }
} 

async function deletePerson(ctx, id, next) {
  try {
    const res = await Person.deleteOne({_id: id});
    ctx.body = res;
    next();
  } catch (err) {
    ctx.throw(400, err);
  }
}

app.listen(3000);

app.on('error', (err, ctx) => {
  ctx.body = err;
});