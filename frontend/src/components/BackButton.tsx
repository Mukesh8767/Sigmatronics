import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export const Back=()=>{
    const navigate=useNavigate();
    return <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-700 hover:text-black hover:underline mb-4 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
}