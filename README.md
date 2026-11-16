# Azure Functions : HTTP → Queue → Table

Application Azure Functions (Node.js, modèle v4) qui reçoit une requête HTTP,
la place dans une file d'attente, puis stocke son contenu dans une table.

## Architecture

```
Client ──HTTP POST──▶ HttpTrigger ──▶ Queue Storage ──▶ QueueTrigger ──▶ Table Storage
                                      (messages-queue)                    (Messages)
```

Les deux fonctions sont indépendantes : elles ne s'appellent jamais
directement et communiquent uniquement via la queue.

## Rôle de chaque fonction

### HttpTrigger
- Déclencheur : HTTP (POST)
- Reçoit une requête, extrait le corps JSON et publie un message dans la queue `messages-queue`.
- Stateless, sans logique métier. Répond `202 Accepted`.

### QueueTrigger
- Déclencheur : arrivée d'un message dans `messages-queue`
- Lit le contenu du message et l'écrit dans la table `Messages`
  (`PartitionKey = messages`, `RowKey` = identifiant du message).

## Prérequis

- Node.js 20 ou 22 (Node 25 n'est pas supporté par le runtime Functions)
- Azure Functions Core Tools v4 (`func --version`)
- Azurite (extension VS Code, ou `npm install -g azurite`)

## Lancer en local

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Démarrer Azurite avec les services Blob, Queue et Table
   (VS Code : *Azurite: Start*, ou `azurite --location ./azurite-data`).
3. Créer le fichier de configuration locale à partir de l'exemple fourni :
   ```bash
   cp local.settings.exemple.json local.settings.json
   ```
   `AzureWebJobsStorage` doit valoir `UseDevelopmentStorage=true`
   (stockage local via Azurite) et `FUNCTIONS_WORKER_RUNTIME` doit valoir `node`.

4. Lancer le runtime :
   ```bash
   func start
   ```
   Les deux fonctions doivent apparaître dans la console.

## Tester

```bash
curl -X POST http://localhost:7071/api/HttpTrigger \
  -H "Content-Type: application/json" \
  -d '{"nom":"Ethan","message":"test"}'
```

Résultat attendu :
- réponse `202`
- logs de `QueueTrigger` affichant le message reçu
- une nouvelle ligne dans la table `Messages`
  (visible avec Azure Storage Explorer).
