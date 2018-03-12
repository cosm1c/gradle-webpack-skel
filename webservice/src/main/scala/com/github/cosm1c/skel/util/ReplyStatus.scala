package com.github.cosm1c.skel.util

object ReplyStatus {

    sealed trait Reply extends Serializable

    @SerialVersionUID(1L)
    final case object ReplySuccess extends Reply

    @SerialVersionUID(1L)
    final case object ReplyFailure extends Reply

}
