import { Players, ReplicatedStorage } from "@rbxts/services";
import { receiveReplication } from "./receiveReplication";
import { CharacterRigR15 } from "@rbxts/promise-character";
import { ClientState } from "shared/clientState";
import { Proton } from "@rbxts/proton";
import { start } from "shared/start";
import Log, { Logger } from "@rbxts/log";
import Roact from "@rbxts/roact";
import { App } from "./ui/app";

Proton.awaitStart();

Log.SetLogger(Logger.configure().WriteTo(Log.RobloxOutput()).Create());

const player = Players.LocalPlayer;
const character = (player.Character || player.CharacterAdded.Wait()[0]) as CharacterRigR15 & { Ball: Part };
const mouse = player.GetMouse();

const state: ClientState = {
	debug: true,
	playerId: undefined,
	entityIdMap: new Map(),
};

start([ReplicatedStorage.Client.systems, ReplicatedStorage.Shared.systems], state)(receiveReplication);

async function bootstrap() {
	while (!state.playerId || !character.Ball) {
		task.wait(0.1);
	}

	Roact.mount(<App />, player.FindFirstChildWhichIsA("PlayerGui")!);
}

bootstrap()
	.andThen((status) => {
		Log.Info("Client Bootstrap complete with status {@Status}", status);
	})
	.catch(Log.Error);
