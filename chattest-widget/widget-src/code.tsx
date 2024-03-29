const { widget } = figma;
const { AutoLayout, Text, useSyncedState, Input, Frame } = widget;
type Message = {
  id: number;
  parentId: number | null;
  text: string;
  sender?: string;
  timestamp?: string;
  isDeleted?: boolean;
  upvotes: number;
  downvotes: number;
  };
type MessageBubbleProps = {
    message: Message;
    onReply: () => void;
    onDelete: () => void;
    upVote:() => void;
    downVote:() =>void;
    replyChain: any; // Or whatever type is appropriate for your replyChain
    replyToId: number | null; // Add this line

  };
 

function ChatWidget() {
    console.log("ChatWidget rendered2");
   
    const [newMessage, setNewMessage] = useSyncedState('newMessage', '');
    const [replyToId, setReplyToId] = useSyncedState<number | null>('replyToId', null);
    const [messages, setMessages] = useSyncedState<Message[]>('messages', []);
    const [userName, setUserName] = useSyncedState('userName', 'Anonymous');
    const [inputPlaceholder, setInputPlaceholder] = useSyncedState('inputPlaceholder', 'Type a message...');
    const [inputActive, setInputActive] = useSyncedState('inputActive', false);
    const [upvotedUsers, setUpvotedUsers] = useSyncedState<User[]>('upvotedUsers', []);
    const [downvotedUsers, setDownvotedUsers] = useSyncedState<User[]>('downvotedUsers', []);
    console.log("Current messages:", messages);
    const renderMessagesWithScroll = () => {
    return (
      <Frame // Use Frame to create a container
        width="fill-parent" // Ensure the Frame takes the full width of the parent
        height={500} // Set a fixed height to simulate a 'maxHeight'
        overflow="scroll" // Allow scrolling for overflow content
      >
        <AutoLayout
          direction="vertical"
          spacing={-100} // Adjust as needed
          padding={4}
        >
          {renderMessages()}
        </AutoLayout>
      </Frame>
    );
  };
  const updateUserName = () => {
    if (figma.currentUser && figma.currentUser.name) {
      setUserName(figma.currentUser.name);
    }
  };
  function deleteMessage(messageId: number) {
    setMessages(messages.map(m => {
      if (m.id === messageId) {
        return {
          id: m.id,
          parentId: m.parentId,
          text: "*This message was deleted*",
          sender: undefined,
          timestamp: undefined,
          isDeleted: true,
          upvotes: 0,
          downvotes: 0,
        };
      }
      return m;
    }));
   
  }
    
    
      const handleAddMessage = () => {
        console.log('handleAddMessage called');
        if (newMessage.trim() !== '') {
            const newId = Date.now();
            const timestampDate = new Date(newId);
            const hours = timestampDate.getHours();
            const minutes = timestampDate.getMinutes();
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes.toString();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12; // Convert to 12-hour format
            const timestampString = `${formattedHours}:${formattedMinutes} ${ampm}`;
            const currentUserName = figma.currentUser && figma.currentUser.name ? figma.currentUser.name : userName;
            const newMessageObject = {
                id: newId,
                parentId: replyToId,
                text: newMessage.trim(),
                sender: currentUserName,
                timestamp: timestampString,
                upvotes: 0,
                downvotes: 0,
            
            };
            setMessages([...messages, newMessageObject]); // Add the new message to the messages state
            setNewMessage(''); // Reset the new message input field
            setReplyToId(null); // Reset replyToId after message is sent
            setInputPlaceholder('Type a message...');
            setInputActive(true); // Simulate active input when a message is added
            setTimeout(() => setInputActive(false), 2000);
        }
    };
    

    const handleReplyToMessage = (id: number) => {
        setReplyToId(id); // Set the ID of the message being replied to
        const messageToReply = messages.find(message => message.id === id);
        if (messageToReply) {
          setNewMessage(""); // Prepare the reply text
          setInputPlaceholder(`Reply to "${messageToReply.text}":`); // Update placeholder to indicate replying
        }
        setInputActive(true); // Simulate active input when reply is initiated
        setTimeout(() => setInputActive(false), 2000);
      };

      const handleupVote = (messageId: number, type: string) => {
        const currentUser = figma.currentUser!;
        if (currentUser && !upvotedUsers.some(user=>user.id===currentUser.id) ) {
          // User has not upvoted
          setMessages(messages.map(m => {
            if (m.id === messageId) {
              return {
                ...m,
                upvotes: type === 'upvote' ? m.upvotes + 1 : m.upvotes,
                
              };
            }
            return m;
          }));
          setUpvotedUsers([...upvotedUsers, currentUser]);
        }
        else{

          console.log("You already upvoted!")
          
        }
      };

      const handledownVote = (messageId: number, type: string) => {
        const currentUser = figma.currentUser;
        if (currentUser && !downvotedUsers.some(user=>user.id===currentUser.id) ) {
          setMessages(messages.map(m => {
            if (m.id === messageId) {
              return {
                ...m,
                downvotes: type === 'downvote' ? m.downvotes + 1 : m.downvotes,
                
              };
            }
            return m;
          }));
          setDownvotedUsers([...downvotedUsers, currentUser]);

        }
        else{
          console.log("You can only downvote once!");
        }
      };

      

      const renderMessages = (parentId: number | null = null) => {
        return messages
          .filter(message => message.parentId === parentId)
          .map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReply={() => handleReplyToMessage(message.id)}
              onDelete={() => deleteMessage(message.id)}
              replyChain={renderMessages(message.id)}
              replyToId={replyToId}
              upVote={()=>handleupVote(message.id, 'upvote')}
              downVote={()=>handledownVote(message.id, 'downvote')}

            />
          ));
      };

     

      
      
      

      return (
        <AutoLayout
      direction="vertical"
      spacing={8}
      padding={8}
      stroke="#DADCE0" // Outline color for the send area
      strokeWidth={1} // Outline width for the send area
      cornerRadius={4} // Rounded corners for the send area
    >
      <AutoLayout 
          direction="horizontal" 
          spacing={100}
          padding={8} 
          stroke={inputActive ? "#007AFF" : "#DADCE0"} // Set the border color to blue by default
          strokeWidth={1} 
          cornerRadius={4} 
      >
                <Input
                    placeholder={inputPlaceholder}
                    value={newMessage}
                    onTextEditEnd={(e) => setNewMessage(e.characters)}
                />
                <AutoLayout // Send button with additional styling
                    fill="#007AFF"
                    padding={8}
                    cornerRadius={4}
                    onClick={handleAddMessage}
                >
                    <Text fontSize={14} fill="#FFFFFF">Send</Text>
                </AutoLayout>
            </AutoLayout>
            <AutoLayout
                direction="vertical"
                spacing={-100} //changed from 1
                padding={4}
            >
                {renderMessages()}
                </AutoLayout>
    </AutoLayout>
    );
}

function MessageBubble({ message, onReply, onDelete, replyChain, replyToId, upVote, downVote }: MessageBubbleProps) {
  console.log("MessageBubble called with message:", message, "and replyToId:", replyToId);
  

  const isReply = message.parentId !== null;
  const isBeingRepliedTo = replyToId === message.id;

  console.log(`Message ID: ${message.id}, ReplyTo ID: ${replyToId}, Is Being Replied To: ${isBeingRepliedTo}`);

  // Define the style for the message bubble
  const messageStyle = {
    fill: isBeingRepliedTo ? "#007AFF" : "#FFFFFF", // Blue if being replied to, otherwise white
    color: isBeingRepliedTo ? "#FFFFFF" : "#000000", // Text color white if being replied to, otherwise black
  };

  

  // Log the message style for debugging
  console.log(messageStyle);

  return (
    <AutoLayout
      direction="vertical"
      padding={{ top: 1, bottom: 10, left: isReply ? 32 : 8, right: 8 }}
      stroke="#D3D3D3" // Light grey outline
      strokeWidth={1} // Width of the outline
      cornerRadius={4} // You can adjust the corner radius to suit your design preferences
      fill={messageStyle.fill}
    >
    {!message.isDeleted && (
      <AutoLayout // Container for sender and timestamp
        direction="horizontal"
        horizontalAlignItems="start"
        verticalAlignItems="center"
        spacing={150}
        padding={{ top: 4, bottom: 0, left: 4, right: 4 }}
         // Apply dynamic background color
      >
          {message.sender && <Text fontSize={14}>{message.sender}:</Text>}
          {message.timestamp && <Text fontSize={12}>{message.timestamp}</Text>}
        </AutoLayout>
      )}
      <AutoLayout // Container for the message text
        direction="horizontal"
        padding={{ top: 4, bottom: 0, left: 4, right: 4 }}
        fill={messageStyle.fill} // Apply dynamic background color
      >
        <Text>{message.isDeleted ? message.text = "*This message was deleted*" : message.text}</Text>
      </AutoLayout>
      {!message.isDeleted && (
      <AutoLayout // Container for Reply and Delete buttons
        direction="horizontal"
        padding={{ top: 4, bottom: 0, left: 4, right: 4 }}
        spacing={8} // Space between buttons
      >
        <AutoLayout // Reply button with additional padding
          fill="#007AFF"
          cornerRadius={4}
          padding={{ top: 6, bottom: 6, left: 8, right: 8 }} // Increased padding for the button
          onClick={onReply}
        >
          <Text fontSize={14} fill="#FFFFFF">Reply</Text>
        </AutoLayout>
        <AutoLayout // Upvote button with additional padding
          fill="#00A79D"
          cornerRadius={4}
          padding={{ top: 6, bottom: 6, left: 8, right: 8 }} // Increased padding for the button
          onClick={upVote}
        >
          <Text fontSize={14} fill="#FFFFFF">Upvote ({message.upvotes})</Text>
        </AutoLayout>
        <AutoLayout // Downvote button with additional padding
          fill="#FF5A5F"
          cornerRadius={4}
          padding={{ top: 6, bottom: 6, left: 8, right: 8 }} // Increased padding for the button
          onClick={downVote}
        >
          <Text fontSize={14} fill="#FFFFFF">Downvote ({message.downvotes})</Text>
        </AutoLayout>
        <AutoLayout // Delete button with additional padding
          fill="#FF3B30"
          cornerRadius={4}
          padding={{ top: 6, bottom: 6, left: 8, right: 8 }} // Increased padding for the button
          onClick={onDelete}
        >
          <Text fontSize={14} fill="#FFFFFF">Delete</Text>
        </AutoLayout>
        </AutoLayout>
        )}
      {replyChain && (
        <AutoLayout
          direction="vertical"
          spacing={30} // Adjusted space between reply chains
        >
          {replyChain}
        </AutoLayout>
      )}
    </AutoLayout>
  );
}

  
  

widget.register(ChatWidget);