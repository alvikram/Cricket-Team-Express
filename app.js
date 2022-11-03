const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjetToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// API1 - GET
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
        *
    FROM 
        cricket_team;
    `;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDbObjetToResponseObject(eachPlayer))
  );
});

// API2 - add new player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
            cricket_team (player_name,jersey_number, role)
        VALUES
            (
                '${playerName}',
                '${jerseyNumber}',
                '${role}'
            );
    `;
  const player = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerID = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const playerArray = await db.get(getPlayerID);
  response.send(convertDbObjetToResponseObject(playerArray));
});

//API 4 - UPDATE
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `
        UPDATE 
            cricket_team
        SET 
            player_name = '${playerName}',
            jersey_number= '${jerseyNumber}',
            role = '${role}'
        WHERE
            player_id = ${playerId} ;   
            `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 5 - DELETE
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
