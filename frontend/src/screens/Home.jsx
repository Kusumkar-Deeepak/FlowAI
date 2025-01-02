import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);

  console.log('user',user);
  // Fetch projects on component mount
  useEffect(() => {
    axios
      .get('/project/all')
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
      });
  }, []); // Run only once when the component mounts

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const createProject = () => {
    axios
      .post('/project/create', {
        name: projectName,
      })
      .then((res) => {
        console.log('Project created successfully:', res.data);
        setProjects([...projects, res.data.project]); // Update project list
        setProjectName(''); // Reset input field
        closeModal(); // Close modal
      })
      .catch((err) => {
        console.error('Error creating project:', err);
      });
  };

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap items-start gap-4">
        <button
          onClick={openModal}
          className="project h-20 w-48 flex items-center justify-center p-3 border border-slate-300 rounded-md hover:bg-gray-200 text-center shadow-sm"
        >
          <i className="ri-link text-xl"></i>
          <span className="text-sm font-medium">New Project</span>
        </button>

        {projects.map((project) => (
          <div
            onClick={() => {
              navigate('/project', {
                state: {project}
              })
            }}
            key={project._id}
            className="project h-20 w-48 flex flex-col justify-between p-3 border border-slate-300 rounded-md hover:bg-gray-200 shadow-sm"
          >
            <h2 className="text-sm font-semibold truncate">{project.name}</h2>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <i className="ri-user-line text-base"></i>
              <span>{project.users.length} {project.users.length === 1 ? 'Collaborator' : 'Collaborators'}</span>
            </div>
          </div>
        ))}
      </div>


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Project</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProject();
              }}
            >
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-500"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
