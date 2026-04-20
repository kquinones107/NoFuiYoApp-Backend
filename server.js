const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado a MongoDB');

    // The email_1 index may have been created without sparse:true in a previous
    // schema version.  A non-sparse unique index treats every missing/null email
    // as null, so a second user without an email causes E11000.
    // Drop the stale index so Mongoose recreates it correctly (sparse:true).
    try {
      const User = require('./models/User');
      await User.collection.dropIndex('email_1');
      console.log('✅ Dropped stale email_1 index — will be recreated as sparse');
    } catch (err) {
      if (err.code === 27) {
        // IndexNotFound — index was already correct or doesn't exist, nothing to do
      } else {
        console.warn('⚠️  Could not drop email_1 index:', err.message);
      }
    }

    await mongoose.model('User').syncIndexes();
    console.log('✅ User indexes synced');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });