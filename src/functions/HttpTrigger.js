const { app, output } = require('@azure/functions');

// Binding de sortie : la queue dans laquelle on publie
const queueOutput = output.storageQueue({
    queueName: 'messages-queue',
    connection: 'AzureWebJobsStorage',
});

app.http('HttpTrigger', {
    methods: ['POST'],
    authLevel: 'anonymous',
    extraOutputs: [queueOutput],
    handler: async (request, context) => {
        // 1. Extraire les données reçues
        const body = await request.json();

        // 2. Publier dans la queue (aucune autre logique)
        context.extraOutputs.set(queueOutput, body);

        context.log('Message envoyé dans la queue');
        return { status: 202, body: 'Message accepté' };
    },
});

// app.http('HttpTrigger', {
//     methods: ['GET', 'POST'],
//     authLevel: 'anonymous',
//     handler: async (request, context) => {
//         context.log(`Http function processed request for url "${request.url}"`);

//         const name = request.query.get('name') || await request.text() || 'world';

//         return { body: `Hello, ${name}!` };
//     }
// });
