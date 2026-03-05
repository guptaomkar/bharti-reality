import { useContext, useEffect, useState } from "react"
import { AiFillHeart } from "react-icons/ai"
import useAuthCheck from "../../hooks/useAuthCheck"
import { useMutation, useQueryClient } from "react-query"
import { useAuth } from "../../context/AuthContext"
import UserDetailContext from "../../context/UserDetailContext"
import { checkFavourites, updateFavourites } from "../../utils/common"
import { toFav } from "../../utils/api"

const Heart = ({ id }) => {

    const [heartColor, setHeartColor] = useState("white")
    const { validateLogin } = useAuthCheck()
    const { user, token } = useAuth()
    const queryClient = useQueryClient()

    const {
        userDetails: { favourites },
        setUserDetails,
    } = useContext(UserDetailContext);

    useEffect(() => {
        setHeartColor(() => checkFavourites(id, favourites))
    }, [favourites])


    const { mutate } = useMutation({
        mutationFn: () => toFav(id, user?.email, token),
        onSuccess: (data) => {
            setUserDetails((prev) => (
                {
                    ...prev,
                    favourites: data.favResidenciesID || prev.favourites
                }
            ))
            queryClient.invalidateQueries(["favIds", user?.email])
        }
    })

    const handleLike = () => {
        if (validateLogin()) {
            mutate()
            setHeartColor((prev) => prev === "#fa3e5f" ? "white" : "#fa3e5f")
        }
    }

    return (
        <AiFillHeart size={24} color={heartColor} onClick={(e) => {
            e.stopPropagation()
            handleLike()
        }} />
    )
}

export default Heart