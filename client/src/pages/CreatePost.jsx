import { useLocation } from 'react-router-dom'
import CreatePostForm from '../components/CreatePostForm'

function CreatePost() {
  const location = useLocation()
  const { promptId, promptText } = location.state || {}

  return <CreatePostForm promptId={promptId} promptText={promptText} />
}

export default CreatePost