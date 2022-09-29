import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;

  //check token
  const user = checkToken(req)
  if(!user) return res.status(401).json({ok: false, message: "Yon don't permission to access this api"})

  const rooms = readChatRoomsDB();

  //check if roomId exist
  const foundRoom = rooms.find((x) => x.roomId === roomId)
  if(!foundRoom) return res.status(404).json({ok: false, message: "Invalid room id"})

  //check if messageId exist
  const messageIdx = foundRoom.messages.findIndex((x) => x.messageId === messageId)
  if(messageIdx === -1) return res.status(404).json({ok: false, message: "Invalid message id"})

  //check if token owner is admin, they can delete any message
  if(user.isAdmin === true) foundRoom.messages.splice(messageIdx, 1);
  //or if token owner is normal user, they can only delete their own message!
  if(user.isAdmin === false){
    if(user.username.username === foundRoom.messages[messageIdx].username){
      foundRoom.messages.splice(messageIdx, 1);
    }else return res.status(403).json({ok: false, message: "Yon do not have permission to access this data"})
  }
  writeChatRoomsDB(rooms)
  return res.status(200).json({ok: true})
}
