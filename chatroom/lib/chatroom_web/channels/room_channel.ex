defmodule ChatroomWeb.RoomChannel do
  use Phoenix.Channel

  def join("chatroom:lobby", _message, socket) do
    {:ok, socket}
  end

  def join("chatroom:" <> _private_room_id, _params, _socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # Handle user input (chat messages), and sanitize them before broadcast.
  def handle_in("new_msg", %{"body" => body, "id" => id, "letter" => letter}, socket) do
    broadcast!(socket, "new_msg", %{body: HtmlSanitizeEx.basic_html(body), id: id, letter: letter})
    {:noreply, socket}
  end
end
