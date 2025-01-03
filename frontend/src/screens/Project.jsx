import { useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef, useContext } from "react";
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from "../config/socket";
import { UserContext } from "../context/user.context";
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';


// function SyntaxHighlightedCode({ children, className }) {
//   const ref = useRef(null);

//   useEffect(() => {
//     // eslint-disable-next-line react/prop-types
//     if (ref.current && className?.includes('lang-') && hljs) {
//       hljs.highlightElement(ref.current);
//     }
//   }, [className, children]);

//   return (
//     <code ref={ref} className={className}>
//       {children}
//     </code>
//   );
// }

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  React.useEffect(() => {
    // eslint-disable-next-line react/prop-types
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute('data-highlighted')
    }
    // eslint-disable-next-line react/prop-types
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState('');
  const { user } = useContext(UserContext)
  const [users, setUsers] = useState([]);
  const messageBox = React.createRef();
  const [messages, setMessages] = useState([]);  // Array to store messages
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null);

  const [openFiles, setOpenFiles] = useState([])

  console.log('user', user);

  function send() {
    sendMessage('project-message', {
      message,
      sender: user,
    });

    // Append outgoing message to state
    setMessages(prevMessages => [
      ...prevMessages,
      { sender: user, message }
    ]);

    setMessage(""); // Clear message input
  }

  useEffect(() => {
    initializeSocket(project._id);

    receiveMessage('project-message', data => {
      try {
          if (data.sender._id === 'ai') {
              const parsedMessage = JSON.parse(data.message); // Validate JSON format
              console.log('parsedMessage', parsedMessage)
              if (parsedMessage.fileTree) {
                  setFileTree(parsedMessage.fileTree || {});
              }
              setMessages(prevMessages => [...prevMessages, data]);
          } else {
              setMessages(prevMessages => [...prevMessages, data]);
          }
      } catch (error) {
          console.error('Error parsing AI response:', error);
      }
  });
  




    axios.get(`/project/get-project/${location.state.project._id}`).then((res) => {
      setProject(res.data.project);
      console.log('project:', res.data.project);
    });

    axios.get('/users/all')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.error('Unexpected response format:', res.data);
          setUsers([]); // Fallback to an empty array
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }


  const handleUserClick = (id) => {
    setSelectedUserIds((prevSelected) => {
      const updatedSet = new Set(prevSelected);
      if (updatedSet.has(id)) {
        updatedSet.delete(id);
      } else {
        updatedSet.add(id);
      }
      return [...updatedSet];
    });
  };

  const handleAddCollaborator = () => {
    if (selectedUserIds.length > 0) {
      axios
        .put('/project/add-user', {
          projectId: location.state.project._id,
          users: Array.from(selectedUserIds),
        })
        .then((res) => {
          console.log("Collaborators added successfully!", res.data);
          setSelectedUserIds([]);
          setIsModalOpen(false);
        })
        .catch((err) => {
          console.error("Error adding collaborators:", err);
        });
    } else {
      console.log("No users selected.");
    }
  };


  function WriteAiMessage(message) {

    const messageObject = JSON.parse(message)

    return (
      <div
        className='overflow-auto bg-slate-950 text-white rounded-sm p-2'
      >
        <Markdown
          // eslint-disable-next-line react/no-children-prop
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>)
  }

  const filteredUsers = users.filter((user) =>
    (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="h-screen w-screen flex bg-slate-50">
      {/* Left Section */}
      <section className="left flex flex-col h-screen min-w-[24rem] bg-slate-100 text-gray-700 relative">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-slate-200 shadow-sm z-20 sticky top-0">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 p-2 bg-slate-100 rounded-md hover:bg-slate-300 transition"
          >
            <i className="ri-add-fill text-lg"></i>
            <p className="text-sm font-medium">Add Collaborators</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="flex gap-2 p-2 rounded-full hover:bg-slate-300 transition"
          >
            <i className="ri-group-fill text-xl"></i>
          </button>
        </header>

        {/* Conversation Area */}
        <div className="conversation-area flex-grow flex flex-col relative overflow-y-auto pb-20">
          <div
            ref={messageBox}
            className="message-box flex-grow flex flex-col gap-1 bg-slate-50 p-4 overflow-y-auto max-h-full border-t border-slate-300 rounded-lg hide-scrollbar"
          >
            {/* Render messages by mapping through the messages array */}
            {messages.map((msg, index) => (
              <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-96' : 'max-w-54'} ${msg.sender._id == user._id.toString() && 'ml-auto'}  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                <div className='text-sm'>
                  {msg.sender._id === 'ai' ?

                    WriteAiMessage(msg.message)
                    : msg.message}
                </div>
              </div>
            ))}

          </div>
          <div className="spacer h-[10px]"></div>
          <div className="inputField w-full flex items-center mt-4 p-4 bg-slate-50 absolute bottom-0 left-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-grow p-3 px-4 text-gray-800 bg-slate-50 rounded-l-md border-none outline-none"
              type="text"
              placeholder="Enter Message"
            />
            <button onClick={send} className="p-3 bg-slate-950 text-white rounded-r-md">
              <i className="ri-send-plane-fill text-lg"></i>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div
          className={`sidePanel absolute top-0 h-full flex flex-col gap-2 bg-slate-50 transition-transform duration-300 border-l border-slate-300 z-30 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ minWidth: "24rem" }}
        >
          <header className="flex justify-between items-center px-4 py-4 bg-slate-200 sticky top-0 shadow-sm">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(false)} className="p-2">
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2 px-4 py-2 overflow-y-auto">
            {project.users && project.users.map((user, index) => (
              <div
                key={user._id || index}
                className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
              >
                <div className="aspect-square rounded-full w-12 h-12 flex items-center justify-center text-white bg-slate-400">
                  <i className="ri-user-fill"></i>
                </div>
                <h1 className="font-semibold text-lg">{user.email || "Unknown User"}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="right bg-slate-100 flex-grow h-full flex">
        {/* Explorer Section */}
        <div className="explorer h-full min-w-52 max-w-64 bg-slate-200 shadow-md border-r border-slate-300">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  if (fileTree[file].file) {
                    setCurrentFile(file); // Set file for editing
                    setOpenFiles([...new Set([...openFiles, file])]); // Avoid duplicates
                  }
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 hover:bg-slate-300 w-full transition duration-150 ease-in-out"
              >
                <p className="font-medium text-base text-slate-800">{file}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Code Editor Section */}
        {currentFile && (
          <div className="code-editor flex flex-col flex-grow h-full bg-slate-50 shadow-inner">
            {/* Open Files Tabs */}
            <div className="top flex bg-slate-200 border-b border-slate-300">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center gap-2 text-sm font-medium border-r border-slate-300 transition duration-150 ease-in-out ${currentFile === file ? "bg-slate-300 text-slate-900" : "hover:bg-slate-200 text-slate-700"
                    }`}
                >
                  {file}
                </button>
              ))}
            </div>

            {/* Code Editor Area */}
            <div className="bottom flex flex-grow">
              {fileTree[currentFile]?.file?.contents && (
                <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                  <pre className="hljs h-full">
                    <code
                      className="hljs h-full outline-none"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const updatedContent = e.target.innerText;
                        setFileTree((prevFileTree) => ({
                          ...prevFileTree,
                          [currentFile]: {
                            file: {
                              contents: updatedContent, // Update the content
                            },
                          },
                        }));
                      }}
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlight(
                          'javascript',
                          fileTree[currentFile].file.contents || ''
                        ).value, // Highlight syntax
                      }}
                      style={{
                        whiteSpace: 'pre-wrap', // Preserve whitespace
                        paddingBottom: '25rem', // Add space for scrolling
                      }}
                    />
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </section>



      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select Users</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </header>

            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                className="flex-grow p-2 border border-gray-300 rounded-md"
                placeholder="Search Users"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="user-list flex flex-col gap-2 mb-6 max-h-96 overflow-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${selectedUserIds.includes(user._id) ? "bg-blue-300" : ""
                    } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-slate-300 rounded-full">
                    <i className="ri-user-line text-lg text-white"></i>
                  </div>
                  <p className="text-gray-800">{user.email}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddCollaborator}
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
