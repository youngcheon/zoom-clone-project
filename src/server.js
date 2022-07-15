import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public/js", express.static(__dirname + "/public/js"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer); // socket server (io)

let currennt_room_name;

wsServer.on("connection", (socket) => {
  socket.on("join_room", (room_name, local_socket_id) => {
    console.log(`join_room: ( ${room_name} ) ${local_socket_id}`);
    currennt_room_name = room_name;
    socket.join(room_name);
    socket.to(room_name).emit("welcome", local_socket_id);
  });
  socket.on("offer", (offer, local_socket_id, remote_socket_id, index) => {
    socket.to(remote_socket_id).emit("offer", offer, local_socket_id, index);
  });
  socket.on("answer", (answer, remote_socket_id, localIndex, remote_index) => {
    socket
      .to(remote_socket_id)
      .emit("answer", answer, localIndex, remote_index);
  });
  socket.on("ice", (ice, remote_socket_id, index) => {
    socket.to(remote_socket_id).emit("ice", ice, index);
  });

  // leave room
  socket.on("disconnecting", (reason) => {
    console.log(`disconnecting ( ${currennt_room_name} ): ${reason}`);
    socket.to(currennt_room_name).emit("leave_room", socket.id);
  });

  // take photo
  socket.on("take_photo", (room_name) => {
    socket.to(room_name).emit("take_photo");
  });
});

const handleListen = () => console.log("listening on port 3000");
httpServer.listen(3000, handleListen);
