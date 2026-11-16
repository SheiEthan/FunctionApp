const { app, output } = require('@azure/functions');

// Binding de sortie : la table dans laquelle on écrit
const tableOutput = output.table({
    tableName: 'Messages',
    connection: 'AzureWebJobsStorage',
});

app.storageQueue('QueueTrigger', {
    queueName: 'messages-queue',          // même nom que dans la fonction HTTP
    connection: 'AzureWebJobsStorage',
    extraOutputs: [tableOutput],
    handler: async (queueItem, context) => {
        context.log('Message reçu :', queueItem);

        // Une entité Table doit avoir PartitionKey et RowKey
        context.extraOutputs.set(tableOutput, {
            PartitionKey: 'messages',
            RowKey: context.triggerMetadata.id,   // identifiant unique du message
            ...queueItem,                          // nom, message, etc.
        });
    },
});
