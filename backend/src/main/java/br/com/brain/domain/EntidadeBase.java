package br.com.brain.domain;

import org.hibernate.envers.Audited;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;

import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@Audited
@Getter
@Setter
public abstract class EntidadeBase {

    @CreatedDate
    @Column(name = "criado_em", updatable = false)
    protected Instant criadoEm;

    @CreatedBy
    @Column(name = "criado_por", updatable = false)
    protected Long criadoPor;

    @LastModifiedDate
    @Column(name = "atualizado_em", nullable = false)
    protected Instant atualizadoEm;

    @LastModifiedBy
    @Column(name = "atualizado_por")
    protected Long atualizadoPor;
}
